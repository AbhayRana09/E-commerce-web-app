from math import ceil
from typing import Optional, Any, cast, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body

from app.database import db
from app.dependencies.auth import get_current_user, require_admin
from app.schemas.order import (
    OrderOut,
    OrderPaginatedOut,
    OrderStatusEnum,
    OrderStatusUpdate,
    OrderCreateIn,
    OrderSimulatePaymentIn,
    OrderCancelIn,
    AdminStatsOut,
    RecentOrderSummary,
)

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# ----------------------------------------------------
# ADMIN ANALYTICS & STATS
# ----------------------------------------------------

@router.get("/admin/stats", response_model=AdminStatsOut)
async def get_admin_dashboard_stats(current_admin=Depends(require_admin)):
    """Fetch comprehensive metrics and aggregation analytics for Admin Dashboard."""
    total_products = await db.product.count()
    active_products = await db.product.count(where=cast(Any, {"is_active": True}))
    out_of_stock = await db.product.count(where=cast(Any, {"stock_quantity": 0}))
    total_categories = await db.category.count()
    total_customers = await db.user.count(where=cast(Any, {"role": "CUSTOMER"}))
    total_orders = await db.order.count()

    orders_for_sales = await db.order.find_many(
        where=cast(Any, {"status": {"not": "CANCELLED"}})
    )
    total_sales = sum(o.total_amount for o in orders_for_sales) if orders_for_sales else 0.0

    recent_raw_orders = await db.order.find_many(
        order=cast(Any, {"created_at": "desc"}),
        take=6,
        include=cast(Any, {"user": True, "items": True})
    )

    recent_orders = [
        RecentOrderSummary(
            id=o.id,
            customer_name=f"{o.user.first_name} {o.user.last_name}" if o.user else "Guest Customer",
            customer_email=o.user.email if o.user else "N/A",
            status=OrderStatusEnum(o.status.value if hasattr(o.status, "value") else str(o.status)),
            items_count=len(o.items) if o.items else 0,
            total_amount=o.total_amount,
            created_at=o.created_at
        )
        for o in recent_raw_orders
    ]

    return {
        "total_products": total_products,
        "active_products": active_products,
        "out_of_stock": out_of_stock,
        "total_categories": total_categories,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_sales": round(total_sales, 2),
        "recent_orders": recent_orders
    }

# ----------------------------------------------------
# ADMIN ORDERS MANAGEMENT
# ----------------------------------------------------

@router.get("/admin", response_model=OrderPaginatedOut)
async def list_all_orders_admin(
    search: Optional[str] = Query(None, description="Search by customer name, email, or order ID"),
    order_status: Optional[OrderStatusEnum] = Query(None, alias="status", description="Filter by order status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_admin=Depends(require_admin)
):
    """Fetch paginated orders for admin with search & status filters."""
    where: dict[str, Any] = {}

    if order_status:
        where["status"] = order_status.value

    if search and search.strip():
        search_term = search.strip()
        or_conditions: list[dict[str, Any]] = [
            {"user": {"first_name": {"contains": search_term, "mode": "insensitive"}}},
            {"user": {"last_name": {"contains": search_term, "mode": "insensitive"}}},
            {"user": {"email": {"contains": search_term, "mode": "insensitive"}}},
        ]
        if search_term.isdigit():
            or_conditions.append({"id": int(search_term)})

        where["OR"] = or_conditions

    skip = (page - 1) * limit

    orders = await db.order.find_many(
        where=cast(Any, where),
        include=cast(Any, {
            "user": True,
            "address": True,
            "coupon": True,
            "items": {"include": {"product": True}}
        }),
        order=cast(Any, {"created_at": "desc"}),
        skip=skip,
        take=limit
    )

    total = await db.order.count(where=cast(Any, where))
    total_pages = ceil(total / limit) if total > 0 else 1

    return {
        "items": orders,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/admin/{order_id}", response_model=OrderOut)
async def get_order_detail_admin(
    order_id: int,
    current_admin=Depends(require_admin)
):
    """Fetch single order full details for admin."""
    order = await db.order.find_unique(
        where={"id": order_id},
        include=cast(Any, {
            "user": True,
            "address": True,
            "coupon": True,
            "items": {"include": {"product": True}}
        })
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order

@router.patch("/admin/{order_id}/status", response_model=OrderOut)
async def update_order_status_admin(
    order_id: int,
    status_in: OrderStatusUpdate,
    current_admin=Depends(require_admin)
):
    """Update order lifecycle status (Admin only)."""
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    updated_order = await db.order.update(
        where={"id": order_id},
        data=cast(Any, {"status": status_in.status.value}),
        include=cast(Any, {
            "user": True,
            "address": True,
            "coupon": True,
            "items": {"include": {"product": True}}
        })
    )
    return updated_order

# ----------------------------------------------------
# CUSTOMER ORDER PLACEMENT & ORDER FLOW
# ----------------------------------------------------

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreateIn,
    current_user=Depends(get_current_user)
):
    """Creates a new customer order from their shopping cart items."""
    # 1. Fetch user's cart
    cart = await db.cart.find_unique(
        where={"user_id": current_user.id},
        include=cast(Any, {"items": {"include": {"product": True}}})
    )
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty. Add products before checking out."
        )

    # 2. Verify Shipping Address belongs to user
    address = await db.address.find_first(
        where=cast(Any, {"id": payload.address_id, "user_id": current_user.id})
    )
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selected shipping address was not found."
        )

    # 3. Calculate subtotal & check stock
    subtotal = 0.0
    for item in cart.items:
        if not item.product or not item.product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{item.product.name if item.product else 'Item'}' is currently unavailable."
            )
        if item.product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for '{item.product.name}'. Available: {item.product.stock_quantity}, requested: {item.quantity}"
            )
        subtotal += item.product.price * item.quantity

    # 4. Process Coupon if provided
    coupon_id = None
    discount = 0.0
    if payload.coupon_code and payload.coupon_code.strip():
        code = payload.coupon_code.strip().upper()
        coupon = await db.coupon.find_unique(where={"code": code})
        if not coupon or not coupon.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Coupon code '{code}' is invalid or inactive."
            )
        if subtotal < coupon.min_order_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum order of ${coupon.min_order_amount:.2f} required for coupon '{code}'."
            )
        coupon_id = coupon.id
        if coupon.discount_type == "PERCENTAGE":
            discount = round((subtotal * coupon.discount_value) / 100.0, 2)
        else:
            discount = round(min(subtotal, coupon.discount_value), 2)

    # 5. Calculate taxes and shipping
    shipping_cost = 0.0 if (subtotal > 100 or subtotal == 0) else 9.99
    taxable_amount = max(0.0, subtotal - discount)
    tax_amount = round(taxable_amount * 0.08, 2)
    total_amount = round(taxable_amount + shipping_cost + tax_amount, 2)

    # 6. Create Order record
    order = await db.order.create(
        data=cast(Any, {
            "user_id": current_user.id,
            "address_id": address.id,
            "coupon_id": coupon_id,
            "status": "PENDING" if payload.payment_method != "COD" else "CONFIRMED",
            "payment_method": payload.payment_method,
            "payment_status": "PENDING",
            "subtotal": subtotal,
            "shipping_cost": shipping_cost,
            "discount": discount,
            "tax_amount": tax_amount,
            "total_amount": total_amount,
            "items": {
                "create": [
                    {
                        "product_id": item.product_id,
                        "quantity": item.quantity,
                        "price_at_purchase": item.product.price
                    }
                    for item in cart.items
                    if item.product is not None
                ]
            }
        }),
        include=cast(Any, {
            "user": True,
            "address": True,
            "coupon": True,
            "items": {"include": {"product": True}}
        })
    )

    # 7. Deduct product stock & clear cart
    for item in cart.items:
        await db.product.update(
            where={"id": item.product_id},
            data=cast(Any, {"stock_quantity": {"decrement": item.quantity}})
        )

    await db.cartitem.delete_many(where=cast(Any, {"cart_id": cart.id}))

    return order

@router.post("/{order_id}/simulate-payment")
@router.post("/{order_id}/pay")
async def simulate_order_payment(
    order_id: int,
    payload: OrderSimulatePaymentIn,
    current_user=Depends(get_current_user)
):
    """Simulates payment gateway authorization and capture."""
    order = await db.order.find_first(
        where=cast(Any, {"id": order_id, "user_id": current_user.id})
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )

    if not payload.simulate_success:
        await db.order.update(
            where={"id": order_id},
            data=cast(Any, {"payment_status": "FAILED"})
        )
        return {
            "success": False,
            "message": "Payment simulation was declined by issuer.",
            "order_id": order_id,
            "status": "PAYMENT_FAILED"
        }

    # Success or COD: Mark order as CONFIRMED, COD payment_status remains PENDING
    payment_status = "PENDING" if payload.payment_method == "COD" else "PAID"
    await db.order.update(
        where={"id": order_id},
        data=cast(Any, {
            "status": "CONFIRMED",
            "payment_status": payment_status,
            "payment_method": payload.payment_method
        })
    )

    return {
        "success": True,
        "message": "Payment captured and order confirmed successfully!" if payload.payment_method != "COD" else "Order confirmed with Cash on Delivery!",
        "order_id": order_id,
        "status": "CONFIRMED"
    }

@router.get("/my", response_model=List[OrderOut])
@router.get("/my-orders", response_model=List[OrderOut])
async def get_my_orders(current_user=Depends(get_current_user)):
    """Fetch order history for authenticated customer."""
    orders = await db.order.find_many(
        where=cast(Any, {"user_id": current_user.id}),
        include=cast(Any, {
            "user": True,
            "address": True,
            "coupon": True,
            "items": {"include": {"product": True}}
        }),
        order=cast(Any, {"created_at": "desc"})
    )
    return orders

@router.get("/{order_id}", response_model=OrderOut)
async def get_single_order(
    order_id: int,
    current_user=Depends(get_current_user)
):
    """Fetch details for a single order owned by user or viewed by admin."""
    order = await db.order.find_unique(
        where={"id": order_id},
        include=cast(Any, {
            "user": True,
            "address": True,
            "coupon": True,
            "items": {"include": {"product": True}}
        })
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    if current_user.role != "ADMIN" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order."
        )

    return order

@router.patch("/{order_id}/cancel", response_model=OrderOut)
async def cancel_my_order(
    order_id: int,
    payload: Optional[OrderCancelIn] = Body(None),
    current_user=Depends(get_current_user)
):
    """Allows customer to cancel a pending order and restore stock."""
    order = await db.order.find_first(
        where=cast(Any, {"id": order_id, "user_id": current_user.id}),
        include=cast(Any, {"items": True})
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )

    if order.status not in ["PENDING", "CONFIRMED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status '{order.status}'."
        )

    # Restore stock
    if order.items:
        for item in order.items:
            await db.product.update(
                where={"id": item.product_id},
                data=cast(Any, {"stock_quantity": {"increment": item.quantity}})
            )

    reason_str = payload.reason.strip() if payload and payload.reason and payload.reason.strip() else "Cancelled by customer"

    cancelled = await db.order.update(
        where={"id": order_id},
        data=cast(Any, {
            "status": "CANCELLED",
            "cancellation_reason": reason_str
        }),
        include=cast(Any, {
            "user": True,
            "address": True,
            "coupon": True,
            "items": {"include": {"product": True}}
        })
    )
    return cancelled
