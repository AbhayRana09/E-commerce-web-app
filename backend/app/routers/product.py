import re
from math import ceil
from typing import Optional
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

@router.get("", response_model=ProductPaginatedOut)
async def list_products(
    search: Optional[str] = Query(None, description="Search query for product name or description"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    min_price: Optional[float] = Query(None, ge=0, description="Filter by minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Filter by maximum price"),
    sort: Optional[str] = Query("newest", enum=["newest", "price_asc", "price_desc"], description="Sort ordering"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Items per page")
):
    """Fetch paginated product list with search, category, price filtering, and sorting."""
    where = {"is_active": True}

    if category_id is not None:
        where["category_id"] = category_id

    if min_price is not None or max_price is not None:
        price_filter = {}
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
    order = {"created_at": "desc"}
    if sort == "price_asc":
        order = {"price": "asc"}
    elif sort == "price_desc":
        order = {"price": "desc"}

    skip = (page - 1) * limit

    products = await db.product.find_many(
        where=where,
        include={"category": True},
        order=order,
        skip=skip,
        take=limit
    )

    total = await db.product.count(where=where)
    total_pages = ceil(total / limit) if total > 0 else 1

    return {
        "items": products,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/{slug}", response_model=ProductOut)
async def get_product_by_slug(slug: str):
    """Fetch single product details by slug."""
    product = await db.product.find_unique(
        where={"slug": slug},
        include={"category": True}
    )
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or currently unavailable"
        )
    return product

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    current_admin=Depends(require_admin)
):
    """Create a new product (Admin only)."""
    # Verify category exists
    category = await db.category.find_unique(where={"id": product_in.category_id})
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified category_id does not exist"
        )

    base_slug = generate_slug(product_in.name)
    slug = base_slug

    # Ensure unique slug
    existing = await db.product.find_unique(where={"slug": slug})
    counter = 1
    while existing:
        slug = f"{base_slug}-{counter}"
        existing = await db.product.find_unique(where={"slug": slug})
        counter += 1

    new_product = await db.product.create(
        data={
            "category_id": product_in.category_id,
            "name": product_in.name,
            "slug": slug,
            "description": product_in.description,
            "price": product_in.price,
            "stock_quantity": product_in.stock_quantity,
            "image_url": product_in.image_url,
            "is_active": True
        },
        include={"category": True}
    )
    return new_product

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
        data=update_data,
        include={"category": True}
    )
    return updated_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_admin=Depends(require_admin)
):
    """Soft delete/deactivate a product (Admin only)."""
    product = await db.product.find_unique(where={"id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    await db.product.update(
        where={"id": product_id},
        data={"is_active": False}
    )
    return None
