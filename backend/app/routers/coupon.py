from datetime import datetime, timezone
from typing import List, Optional, Any, cast
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.database import db
from app.dependencies.auth import require_admin
from app.schemas.coupon import (
    CouponCreate,
    CouponUpdate,
    CouponOut,
    CouponValidateIn,
    CouponValidateOut,
)

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])

# ----------------------------------------------------
# CUSTOMER / CHECKOUT VALIDATION ENDPOINT
# ----------------------------------------------------

@router.post("/validate", response_model=CouponValidateOut)
async def validate_coupon(payload: CouponValidateIn):
    """
    Validates a coupon code against the cart subtotal, validity date range, and calculates discount amount.
    Accessible to all users during checkout.
    """
    code = payload.code.strip().upper()
    coupon = await db.coupon.find_unique(where={"code": code})

    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coupon code '{code}' is invalid or does not exist"
        )

    if not coupon.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon '{code}' is currently inactive"
        )

    now_utc = datetime.now(timezone.utc)

    # Check start date requirement
    if coupon.starts_at:
        starts_at = coupon.starts_at if coupon.starts_at.tzinfo else coupon.starts_at.replace(tzinfo=timezone.utc)
        if now_utc < starts_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Coupon '{code}' is not active yet (valid starting {starts_at.strftime('%b %d, %Y, %I:%M %p')})"
            )

    # Check expiration date requirement
    if coupon.expires_at:
        expires_at = coupon.expires_at if coupon.expires_at.tzinfo else coupon.expires_at.replace(tzinfo=timezone.utc)
        if now_utc > expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Coupon '{code}' expired on {expires_at.strftime('%b %d, %Y, %I:%M %p')}"
            )

    # Check minimum order amount requirement
    if payload.subtotal < coupon.min_order_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon '{code}' requires a minimum order subtotal of ${coupon.min_order_amount:.2f} (Current: ${payload.subtotal:.2f})"
        )

    # Calculate discount
    discount_amount = 0.0
    if coupon.discount_type == "PERCENTAGE":
        discount_amount = round((payload.subtotal * coupon.discount_value) / 100.0, 2)
    else:  # FIXED
        discount_amount = min(payload.subtotal, coupon.discount_value)

    return {
        "valid": True,
        "code": coupon.code,
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value,
        "discount_amount": discount_amount,
        "message": f"Coupon '{coupon.code}' applied successfully!"
    }


@router.get("/public/active", response_model=List[CouponOut])
async def list_active_coupons_public():
    """
    Fetch all currently active and non-expired coupons available for customer checkout offers.
    Accessible without admin privileges.
    """
    now_utc = datetime.now(timezone.utc)
    all_active = await db.coupon.find_many(
        where={"is_active": True},
        order={"min_order_amount": "asc"}
    )
    
    valid_coupons = []
    for coupon in all_active:
        if coupon.starts_at:
            starts_at = coupon.starts_at if coupon.starts_at.tzinfo else coupon.starts_at.replace(tzinfo=timezone.utc)
            if now_utc < starts_at:
                continue
        if coupon.expires_at:
            expires_at = coupon.expires_at if coupon.expires_at.tzinfo else coupon.expires_at.replace(tzinfo=timezone.utc)
            if now_utc > expires_at:
                continue
        valid_coupons.append(coupon)

    return valid_coupons


# ----------------------------------------------------
# ADMIN MANAGEMENT ENDPOINTS (Require Admin Privileges)
# ----------------------------------------------------

@router.get("", response_model=List[CouponOut])
async def list_coupons_admin(
    search: Optional[str] = Query(None, description="Search by coupon code or description"),
    current_admin=Depends(require_admin)
):
    """List all coupons in the system (Admin only)."""
    where: dict[str, Any] = {}
    if search and search.strip():
        term = search.strip()
        where["OR"] = [
            {"code": {"contains": term, "mode": "insensitive"}},
            {"description": {"contains": term, "mode": "insensitive"}}
        ]

    coupons = await db.coupon.find_many(
        where=cast(Any, where),
        order={"created_at": "desc"}
    )
    return coupons

@router.post("", response_model=CouponOut, status_code=status.HTTP_201_CREATED)
async def create_coupon_admin(
    coupon_in: CouponCreate,
    current_admin=Depends(require_admin)
):
    """Create a new promotional discount coupon (Admin only)."""
    existing = await db.coupon.find_unique(where={"code": coupon_in.code})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A coupon with code '{coupon_in.code}' already exists"
        )

    starts_at = coupon_in.starts_at or datetime.now(timezone.utc)
    expires_at = coupon_in.expires_at
    if expires_at and expires_at.hour == 0 and expires_at.minute == 0 and expires_at.second == 0:
        expires_at = expires_at.replace(hour=23, minute=59, second=59, microsecond=999000)

    if starts_at and expires_at and expires_at <= starts_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry date must be after or on the start date"
        )

    coupon = await db.coupon.create(
        data=cast(Any, {
            "code": coupon_in.code,
            "description": coupon_in.description,
            "discount_type": coupon_in.discount_type.value,
            "discount_value": coupon_in.discount_value,
            "min_order_amount": coupon_in.min_order_amount,
            "is_active": coupon_in.is_active,
            "starts_at": starts_at,
            "expires_at": expires_at
        })
    )
    return coupon

@router.get("/{coupon_id}", response_model=CouponOut)
async def get_coupon_detail_admin(
    coupon_id: int,
    current_admin=Depends(require_admin)
):
    """Retrieve full details of a specific coupon (Admin only)."""
    coupon = await db.coupon.find_unique(where={"id": coupon_id})
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    return coupon

@router.put("/{coupon_id}", response_model=CouponOut)
async def update_coupon_admin(
    coupon_id: int,
    coupon_in: CouponUpdate,
    current_admin=Depends(require_admin)
):
    """Update attributes of an existing coupon (Admin only)."""
    coupon = await db.coupon.find_unique(where={"id": coupon_id})
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )

    update_data = {k: v for k, v in coupon_in.model_dump(exclude_unset=True).items() if v is not None}
    if "discount_type" in update_data and hasattr(update_data["discount_type"], "value"):
        update_data["discount_type"] = update_data["discount_type"].value

    if "code" in update_data and update_data["code"] != coupon.code:
        duplicate = await db.coupon.find_unique(where={"code": update_data["code"]})
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Another coupon with code '{update_data['code']}' already exists"
            )

    starts_at = update_data.get("starts_at", coupon.starts_at)
    expires_at = update_data.get("expires_at", coupon.expires_at)
    if starts_at and expires_at and expires_at <= starts_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry date and time must be after the start date and time"
        )

    updated = await db.coupon.update(
        where={"id": coupon_id},
        data=cast(Any, update_data)
    )
    return updated

@router.patch("/{coupon_id}/toggle-active", response_model=CouponOut)
async def toggle_coupon_status_admin(
    coupon_id: int,
    current_admin=Depends(require_admin)
):
    """Quickly toggle coupon active/inactive status (Admin only)."""
    coupon = await db.coupon.find_unique(where={"id": coupon_id})
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )

    updated = await db.coupon.update(
        where={"id": coupon_id},
        data={"is_active": not coupon.is_active}
    )
    return updated

@router.delete("/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coupon_admin(
    coupon_id: int,
    current_admin=Depends(require_admin)
):
    """Delete a coupon (Admin only)."""
    coupon = await db.coupon.find_unique(where={"id": coupon_id})
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )

    await db.coupon.delete(where={"id": coupon_id})
    return None
