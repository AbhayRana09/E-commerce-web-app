import re
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Any, cast
from app.database import db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.dependencies.auth import require_admin

router = APIRouter(prefix="/api/categories", tags=["Categories"])

def generate_slug(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug

@router.get("", response_model=List[CategoryOut])
async def list_categories():
    """Fetch all active categories ordered by name."""
    return await db.category.find_many(order={"name": "asc"})

@router.get("/{slug}", response_model=CategoryOut)
async def get_category_by_slug(slug: str):
    """Fetch single category details by slug."""
    category = await db.category.find_unique(where={"slug": slug})
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    current_admin=Depends(require_admin)
):
    """Create a new category (Admin only)."""
    clean_name = category_in.name.strip()
    slug = generate_slug(clean_name)
    
    existing = await db.category.find_unique(where={"slug": slug})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name/slug already exists"
        )

    return await db.category.create(
        data={
            "name": clean_name,
            "slug": slug,
            "description": category_in.description.strip() if category_in.description else None
        }
    )

@router.put("/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    current_admin=Depends(require_admin)
):
    """Update existing category details (Admin only)."""
    category = await db.category.find_unique(where={"id": category_id})
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    update_data: dict[str, Any] = {}
    if category_in.name is not None:
        clean_name = category_in.name.strip()
        slug = generate_slug(clean_name)
        
        # Check slug conflict with other categories
        existing = await db.category.find_unique(where={"slug": slug})
        if existing and existing.id != category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another category with this name already exists"
            )
            
        update_data["name"] = clean_name
        update_data["slug"] = slug
    if category_in.description is not None:
        update_data["description"] = category_in.description.strip() if category_in.description else None

    return await db.category.update(
        where={"id": category_id},
        data=cast(Any, update_data)
    )

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_admin=Depends(require_admin)
):
    """Delete a category (Admin only)."""
    category = await db.category.find_unique(where={"id": category_id})
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    await db.category.delete(where={"id": category_id})
    return None
