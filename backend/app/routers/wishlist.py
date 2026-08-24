from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
from app.database import db
from app.schemas.wishlist import WishlistResponse
from app.dependencies.auth import get_current_user
from app.routers.cart import get_or_create_user_cart

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

async def format_user_wishlist(user_id: int) -> dict[str, Any]:
    """Retrieve and format the current user's wishlist with full product relations."""
    raw_items = await db.wishlist.find_many(
        where={"user_id": user_id},
        include={"product": {"include": {"category": True}}},
        order={"created_at": "desc"}
    )

    # Filter out any wishlist items where product was deactivated or deleted
    valid_items = []
    product_ids = []
    for item in raw_items:
        product = item.product
        if not product or not product.is_active:
            await db.wishlist.delete(where={"id": item.id})
            continue
        valid_items.append(item)
        product_ids.append(item.product_id)

    return {
        "items": valid_items,
        "total_items": len(valid_items),
        "product_ids": product_ids
    }

@router.get("", response_model=WishlistResponse)
async def get_wishlist(current_user=Depends(get_current_user)):
    """Fetch all saved products in the authenticated user's wishlist."""
    return await format_user_wishlist(current_user.id)

@router.post("/toggle/{product_id}", response_model=WishlistResponse)
async def toggle_wishlist_item(product_id: int, current_user=Depends(get_current_user)):
    """
    Toggle a product in the user's wishlist:
    - If already present, removes it.
    - If absent, adds it.
    """
    product = await db.product.find_unique(where={"id": product_id})
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or unavailable"
        )

    existing = await db.wishlist.find_unique(
        where={
            "user_id_product_id": {
                "user_id": current_user.id,
                "product_id": product_id
            }
        }
    )

    if existing:
        await db.wishlist.delete(where={"id": existing.id})
    else:
        await db.wishlist.create(
            data={
                "user_id": current_user.id,
                "product_id": product_id
            }
        )

    return await format_user_wishlist(current_user.id)

@router.post("/{product_id}", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(product_id: int, current_user=Depends(get_current_user)):
    """Add a product to the user's wishlist (idempotent)."""
    product = await db.product.find_unique(where={"id": product_id})
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or unavailable"
        )

    existing = await db.wishlist.find_unique(
        where={
            "user_id_product_id": {
                "user_id": current_user.id,
                "product_id": product_id
            }
        }
    )

    if not existing:
        await db.wishlist.create(
            data={
                "user_id": current_user.id,
                "product_id": product_id
            }
        )

    return await format_user_wishlist(current_user.id)

@router.delete("/{product_id}", response_model=WishlistResponse)
async def remove_from_wishlist(product_id: int, current_user=Depends(get_current_user)):
    """Remove a product from the user's wishlist."""
    existing = await db.wishlist.find_unique(
        where={
            "user_id_product_id": {
                "user_id": current_user.id,
                "product_id": product_id
            }
        }
    )

    if existing:
        await db.wishlist.delete(where={"id": existing.id})

    return await format_user_wishlist(current_user.id)

@router.post("/{product_id}/move-to-cart", response_model=WishlistResponse)
async def move_wishlist_item_to_cart(product_id: int, current_user=Depends(get_current_user)):
    """
    Atomic operation:
    1. Validates product availability and stock.
    2. Adds/increments product in user's Shopping Cart.
    3. Removes item from user's Wishlist.
    """
    product = await db.product.find_unique(where={"id": product_id})
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product is no longer available"
        )

    if product.stock_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This product is currently out of stock"
        )

    # 1. Add to Cart
    cart = await get_or_create_user_cart(current_user.id)
    existing_cart_item = await db.cartitem.find_unique(
        where={
            "cart_id_product_id": {
                "cart_id": cart.id,
                "product_id": product_id
            }
        }
    )

    if existing_cart_item:
        if existing_cart_item.quantity + 1 > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add more units. You already have the maximum available stock ({product.stock_quantity}) in your cart."
            )
        await db.cartitem.update(
            where={"id": existing_cart_item.id},
            data={"quantity": existing_cart_item.quantity + 1}
        )
    else:
        await db.cartitem.create(
            data={
                "cart_id": cart.id,
                "product_id": product_id,
                "quantity": 1
            }
        )

    # 2. Remove from Wishlist
    existing_wishlist = await db.wishlist.find_unique(
        where={
            "user_id_product_id": {
                "user_id": current_user.id,
                "product_id": product_id
            }
        }
    )
    if existing_wishlist:
        await db.wishlist.delete(where={"id": existing_wishlist.id})

    return await format_user_wishlist(current_user.id)

@router.delete("/clear/all", response_model=WishlistResponse)
async def clear_wishlist(current_user=Depends(get_current_user)):
    """Remove all items from the authenticated user's wishlist."""
    await db.wishlist.delete_many(where={"user_id": current_user.id})
    return await format_user_wishlist(current_user.id)
