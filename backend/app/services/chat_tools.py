from typing import Optional, List, Dict, Any, cast
from app.database import db
from app.routers.order import sync_order_status_by_time

# ----------------------------------------------------
# 1. CATALOG TOOLS (Product Recommendations & Details)
# ----------------------------------------------------

async def get_store_catalog_summary() -> str:
    """Provides a high-level summary of active categories and featured items for LLM system context."""
    categories = await db.category.find_many(take=15)
    products = await db.product.find_many(
        where=cast(Any, {"is_active": True}),
        include=cast(Any, {"category": True}),
        take=20,
        order=cast(Any, {"created_at": "desc"})
    )
    
    cat_names = ", ".join([c.name for c in categories]) if categories else "General"
    sample_items = [
        f"- {p.name} (Cat: {p.category.name if p.category else 'N/A'}, Price: ${p.price:.2f}, Stock: {p.stock_quantity})"
        for p in products[:10]
    ]
    
    return f"Store Categories: {cat_names}\nAvailable Catalog Highlights:\n" + "\n".join(sample_items)


async def search_catalog_products(
    query: Optional[str] = None,
    category_name: Optional[str] = None,
    max_price: Optional[float] = None,
    min_price: Optional[float] = None,
    limit: int = 6
) -> List[Dict[str, Any]]:
    """Searches active products in the database matching user criteria."""
    where: Dict[str, Any] = {"is_active": True}

    if min_price is not None or max_price is not None:
        price_filter: Dict[str, Any] = {}
        if min_price is not None:
            price_filter["gte"] = min_price
        if max_price is not None:
            price_filter["lte"] = max_price
        where["price"] = price_filter

    if category_name and category_name.strip():
        where["category"] = {"name": {"contains": category_name.strip(), "mode": "insensitive"}}

    if query and query.strip():
        search_term = query.strip()
        where["OR"] = [
            {"name": {"contains": search_term, "mode": "insensitive"}},
            {"description": {"contains": search_term, "mode": "insensitive"}}
        ]

    products = await db.product.find_many(
        where=cast(Any, where),
        include=cast(Any, {"category": True, "reviews": True}),
        take=limit,
        order=cast(Any, {"price": "asc"})
    )

    results = []
    for p in products:
        reviews = getattr(p, "reviews", None) or []
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0.0
        results.append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "price": p.price,
            "description": p.description,
            "stock_quantity": p.stock_quantity,
            "in_stock": p.stock_quantity > 0,
            "image_url": p.image_url,
            "category_name": p.category.name if p.category else "Uncategorized",
            "average_rating": avg_rating
        })

    return results


async def get_product_details_by_id(product_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves comprehensive details for a specific product by ID."""
    p = await db.product.find_unique(
        where={"id": product_id},
        include=cast(Any, {"category": True, "reviews": True})
    )
    if not p:
        return None

    reviews = getattr(p, "reviews", None) or []
    avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0.0

    return {
        "id": p.id,
        "name": p.name,
        "slug": p.slug,
        "price": p.price,
        "description": p.description,
        "stock_quantity": p.stock_quantity,
        "in_stock": p.stock_quantity > 0,
        "image_url": p.image_url,
        "category_name": p.category.name if p.category else "Uncategorized",
        "average_rating": avg_rating,
        "reviews_count": len(reviews)
    }


# ----------------------------------------------------
# 2. ORDERS TOOLS (Customer Orders & Tracking)
# ----------------------------------------------------

async def get_user_recent_orders(user_id: int, limit: int = 5) -> List[Dict[str, Any]]:
    """Fetches order history and current milestone status for the authenticated user."""
    orders = await db.order.find_many(
        where=cast(Any, {"user_id": user_id}),
        include=cast(Any, {
            "items": {"include": {"product": True}},
            "address": True
        }),
        order=cast(Any, {"created_at": "desc"}),
        take=limit
    )

    results = []
    for order in orders:
        await sync_order_status_by_time(order)
        order_items = getattr(order, "items", None) or []
        items_summary = [
            f"{item.quantity}x {item.product.name} (${item.price_at_purchase:.2f})"
            for item in order_items if getattr(item, "product", None)
        ]
        status_val = order.status.value if hasattr(order.status, "value") else str(order.status)
        order_addr = getattr(order, "address", None)
        
        results.append({
            "id": order.id,
            "status": status_val,
            "payment_status": order.payment_status,
            "total_amount": order.total_amount,
            "subtotal": order.subtotal,
            "created_at": order.created_at.strftime("%b %d, %Y"),
            "items_count": len(order_items),
            "items_summary": items_summary,
            "delivery_city": order_addr.city if order_addr else "N/A"
        })

    return results


async def get_order_tracking_details(order_id: int, user_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves status and tracking timeline for a specific order owned by user."""
    order = await db.order.find_first(
        where=cast(Any, {"id": order_id, "user_id": user_id}),
        include=cast(Any, {
            "items": {"include": {"product": True}},
            "address": True
        })
    )
    if not order:
        return None

    await sync_order_status_by_time(order)
    status_val = order.status.value if hasattr(order.status, "value") else str(order.status)
    order_items = getattr(order, "items", None) or []
    items_summary = [
        f"{item.quantity}x {item.product.name} (${item.price_at_purchase:.2f})"
        for item in order_items if getattr(item, "product", None)
    ]
    order_addr = getattr(order, "address", None)

    return {
        "id": order.id,
        "status": status_val,
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
        "total_amount": order.total_amount,
        "created_at": order.created_at.strftime("%b %d, %Y, %I:%M %p"),
        "shipped_at": order.shipped_at.strftime("%b %d, %Y") if getattr(order, "shipped_at", None) else None,
        "delivered_at": order.delivered_at.strftime("%b %d, %Y") if getattr(order, "delivered_at", None) else None,
        "items": items_summary,
        "shipping_address": f"{order_addr.street}, {order_addr.city}, {order_addr.state} {order_addr.postal_code}" if order_addr else "Standard Address"
    }
