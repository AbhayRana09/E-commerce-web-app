import re
from math import ceil
from typing import Optional, List, Literal, Any, cast
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database import db
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
    ProductPaginatedOut
)
from app.dependencies.auth import require_admin

router = APIRouter(prefix="/api/products", tags=["Products"])

def generate_slug(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug

def format_product_with_rating(p: Any) -> ProductOut:
    """Safely constructs a ProductOut model with computed rating metrics."""
    reviews = getattr(p, "reviews", None) or []
    if reviews:
        ratings = [r.rating for r in reviews if hasattr(r, "rating")]
        total = len(ratings)
        avg = round(sum(ratings) / total, 1) if total > 0 else 0.0
    else:
        avg = 0.0
        total = 0

    return ProductOut(
        id=p.id,
        category_id=p.category_id,
        name=p.name,
        slug=p.slug,
        description=p.description,
        price=p.price,
        stock_quantity=p.stock_quantity,
        is_active=p.is_active,
        image_url=p.image_url,
        created_at=p.created_at,
        updated_at=p.updated_at,
        category=p.category,
        average_rating=avg,
        reviews_count=total,
    )

@router.get("", response_model=ProductPaginatedOut)
async def list_products(
    search: Optional[str] = Query(None, description="Search query for product name or description"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    min_price: Optional[float] = Query(None, ge=0, description="Filter by minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Filter by maximum price"),
    sort: Literal["newest", "price_asc", "price_desc", "name_asc", "name_desc"] = Query("newest", description="Sort ordering"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Items per page")
):
    """Fetch paginated product list with search, category, price filtering, and sorting."""
    where: dict[str, Any] = {"is_active": True}

    if category_id is not None:
        where["category_id"] = category_id

    if min_price is not None or max_price is not None:
        price_filter: dict[str, Any] = {}
        if min_price is not None:
            price_filter["gte"] = min_price
        if max_price is not None:
            price_filter["lte"] = max_price
        where["price"] = price_filter

    if search and search.strip():
        search_term = search.strip()
        where["OR"] = [
            {"name": {"contains": search_term, "mode": "insensitive"}},
            {"description": {"contains": search_term, "mode": "insensitive"}}
        ]

    # Handle sorting
    order: dict[str, Any] = {"created_at": "desc"}
    if sort == "price_asc":
        order = {"price": "asc"}
    elif sort == "price_desc":
        order = {"price": "desc"}
    elif sort == "name_asc":
        order = {"name": "asc"}
    elif sort == "name_desc":
        order = {"name": "desc"}

    skip = (page - 1) * limit

    raw_products = await db.product.find_many(
        where=cast(Any, where),
        include=cast(Any, {"category": True, "reviews": True}),
        order=cast(Any, order),
        skip=skip,
        take=limit
    )

    items = [format_product_with_rating(p) for p in raw_products]
    total = await db.product.count(where=cast(Any, where))
    total_pages = ceil(total / limit) if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/admin/all", response_model=List[ProductOut])
async def list_all_products_admin(current_admin=Depends(require_admin)):
    """Fetch all products (active and inactive) for admin management with rating summaries."""
    raw_products = await db.product.find_many(
        order=cast(Any, {"created_at": "desc"}),
        include=cast(Any, {"category": True, "reviews": True})
    )
    return [format_product_with_rating(p) for p in raw_products]

@router.get("/admin/stats")
async def get_admin_stats(current_admin=Depends(require_admin)):
    """Fetch summary analytics for Admin Dashboard."""
    total_products = await db.product.count()
    active_products = await db.product.count(where=cast(Any, {"is_active": True}))
    out_of_stock = await db.product.count(where=cast(Any, {"stock_quantity": 0}))
    total_categories = await db.category.count()
    total_users = await db.user.count()

    return {
        "total_products": total_products,
        "active_products": active_products,
        "out_of_stock": out_of_stock,
        "total_categories": total_categories,
        "total_users": total_users
    }

@router.get("/{slug}", response_model=ProductOut)
async def get_product_by_slug(slug: str):
    """Fetch single product details by slug."""
    product = await db.product.find_unique(
        where={"slug": slug},
        include=cast(Any, {"category": True, "reviews": True})
    )
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or currently unavailable"
        )
    return format_product_with_rating(product)

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    current_admin=Depends(require_admin)
):
    """Create a new product (Admin only)."""
    category = await db.category.find_unique(where={"id": product_in.category_id})
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified category_id does not exist"
        )

    base_slug = generate_slug(product_in.name)
    slug = base_slug

    existing = await db.product.find_unique(where={"slug": slug})
    counter = 1
    while existing:
        slug = f"{base_slug}-{counter}"
        existing = await db.product.find_unique(where={"slug": slug})
        counter += 1

    new_product = await db.product.create(
        data=cast(Any, {
            "category_id": product_in.category_id,
            "name": product_in.name,
            "slug": slug,
            "description": product_in.description,
            "price": product_in.price,
            "stock_quantity": product_in.stock_quantity,
            "image_url": product_in.image_url,
            "is_active": True
        }),
        include=cast(Any, {"category": True})
    )
    return format_product_with_rating(new_product)

@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    current_admin=Depends(require_admin)
):
    """Update an existing product (Admin only)."""
    product = await db.product.find_unique(where={"id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    update_data = {k: v for k, v in product_in.model_dump(exclude_unset=True).items() if v is not None}

    if "name" in update_data:
        base_slug = generate_slug(update_data["name"])
        slug = base_slug
        counter = 1
        while True:
            existing = await db.product.find_unique(where={"slug": slug})
            if not existing or existing.id == product_id:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        update_data["slug"] = slug

    if "category_id" in update_data:
        category = await db.category.find_unique(where={"id": update_data["category_id"]})
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specified category_id does not exist"
            )

    updated_product = await db.product.update(
        where={"id": product_id},
        data=cast(Any, update_data),
        include=cast(Any, {"category": True, "reviews": True})
    )
    return format_product_with_rating(updated_product)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_admin=Depends(require_admin)
):
    """Delete or soft deactivate a product (Admin only)."""
    product = await db.product.find_unique(where={"id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    order_items_count = await db.orderitem.count(where=cast(Any, {"product_id": product_id}))
    if order_items_count > 0:
        await db.product.update(
            where={"id": product_id},
            data=cast(Any, {"is_active": False})
        )
    else:
        await db.cartitem.delete_many(where=cast(Any, {"product_id": product_id}))
        await db.wishlist.delete_many(where=cast(Any, {"product_id": product_id}))
        await db.review.delete_many(where=cast(Any, {"product_id": product_id}))
        await db.product.delete(where={"id": product_id})
    return None
