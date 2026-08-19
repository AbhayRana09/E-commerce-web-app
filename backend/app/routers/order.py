from math import ceil
from typing import Optional, Any, cast
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database import db
from app.dependencies.auth import require_admin
from app.schemas.order import (
    OrderOut,
    OrderPaginatedOut,
    OrderStatusEnum,
    OrderStatusUpdate,
    AdminStatsOut,
    RecentOrderSummary
)

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.get("/admin/stats", response_model=AdminStatsOut)
async def get_admin_dashboard_stats(current_admin=Depends(require_admin)):
    """Fetch comprehensive metrics and aggregation analytics for Admin Dashboard."""
    # 1. Total & active products count
    total_products = await db.product.count()
    active_products = await db.product.count(where={"is_active": True})
    out_of_stock = await db.product.count(where={"stock_quantity": 0})
    total_categories = await db.category.count()

    # 2. Total customers (role: CUSTOMER)
    total_customers = await db.user.count(where=cast(Any, {"role": "CUSTOMER"}))

    # 3. Total orders & aggregation for total sales
    total_orders = await db.order.count()

    # Sum of total_amount for non-cancelled orders
    orders_for_sales = await db.order.find_many(
        where=cast(Any, {"status": {"not": "CANCELLED"}})
    )
    total_sales = sum(o.total_amount for o in orders_for_sales) if orders_for_sales else 0.0

    # 4. Recent orders (latest 5)
    recent_raw_orders = await db.order.find_many(
        order={"created_at": "desc"},
        take=6,
        include={
            "user": True,
            "items": True
        }
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
        # If search is a numeric string, also search by exact order ID
        if search_term.isdigit():
            or_conditions.append({"id": int(search_term)})

        where["OR"] = or_conditions

    skip = (page - 1) * limit

    orders = await db.order.find_many(
        where=cast(Any, where),
        include={
            "user": True,
            "address": True,
            "items": {
                "include": {
                    "product": True
                }
            }
        },
        order={"created_at": "desc"},
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
        include={
            "user": True,
            "address": True,
            "items": {
                "include": {
                    "product": True
                }
            }
        }
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
        include={
            "user": True,
            "address": True,
            "items": {
                "include": {
                    "product": True
                }
            }
        }
    )
    return updated_order
