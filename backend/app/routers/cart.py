from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, cast
from app.database import db
from app.schemas.cart import CartOut, CartItemAdd, CartItemUpdate
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])

async def get_or_create_user_cart(user_id: int):
    """Retrieve existing cart or automatically create one for the user."""
    cart = await db.cart.find_unique(where={"user_id": user_id})
    if not cart:
        cart = await db.cart.create(data={"user_id": user_id})
    return cart

async def sync_and_format_cart(cart_id: int, user_id: int) -> dict[str, Any]:
    """
    Synchronizes cart items with live product state (deactivations, stock changes)
    and computes cart totals.
    """
    raw_items = await db.cartitem.find_many(
        where={"cart_id": cart_id},
        include={"product": {"include": {"category": True}}},
        order={"created_at": "asc"}
    )

    valid_items = []
    for item in raw_items:
        product = item.product

        # Drop item if product was deactivated or deleted
        if not product or not product.is_active or product.stock_quantity <= 0:
            await db.cartitem.delete(where={"id": item.id})
            continue

        # Clamp quantity if stock decreased below cart quantity
        if item.quantity > product.stock_quantity:
            updated_item = await db.cartitem.update(
                where={"id": item.id},
                data={"quantity": product.stock_quantity},
                include={"product": {"include": {"category": True}}}
            )
            if updated_item:
                valid_items.append(updated_item)
        else:
            valid_items.append(item)

    subtotal = round(sum(i.quantity * i.product.price for i in valid_items), 2)
    total_items = len(valid_items)

    return {
        "id": cart_id,
        "user_id": user_id,
        "items": valid_items,
        "subtotal": subtotal,
        "total_items": total_items
    }

@router.get("", response_model=CartOut)
async def get_cart(current_user=Depends(get_current_user)):
    """Fetch user's shopping cart with real-time stock sync and price totals."""
    cart = await get_or_create_user_cart(current_user.id)
    return await sync_and_format_cart(cart.id, current_user.id)

@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
async def add_item_to_cart(
    item_in: CartItemAdd,
    current_user=Depends(get_current_user)
):
    """Add a product to the shopping cart or increment existing quantity with stock validation."""
    product = await db.product.find_unique(where={"id": item_in.product_id})
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or currently unavailable"
        )

    if product.stock_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This product is currently out of stock"
        )

    cart = await get_or_create_user_cart(current_user.id)

    # Check if item already exists in user's cart
    existing_item = await db.cartitem.find_unique(
        where={
            "cart_id_product_id": {
                "cart_id": cart.id,
                "product_id": item_in.product_id
            }
        }
    )

    if existing_item:
        new_quantity = existing_item.quantity + item_in.quantity
        if new_quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add more than available stock (Maximum: {product.stock_quantity}, In cart: {existing_item.quantity})"
            )

        await db.cartitem.update(
            where={"id": existing_item.id},
            data={"quantity": new_quantity}
        )
    else:
        if item_in.quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity ({item_in.quantity}) exceeds available stock ({product.stock_quantity})"
            )

        await db.cartitem.create(
            data={
                "cart_id": cart.id,
                "product_id": item_in.product_id,
                "quantity": item_in.quantity
            }
        )

    return await sync_and_format_cart(cart.id, current_user.id)

@router.put("/items/{item_id}", response_model=CartOut)
async def update_cart_item_quantity(
    item_id: int,
    item_in: CartItemUpdate,
    current_user=Depends(get_current_user)
):
    """Update item quantity in cart with available stock boundary validation."""
    cart = await get_or_create_user_cart(current_user.id)

    cart_item = await db.cartitem.find_unique(
        where={"id": item_id},
        include={"product": True}
    )

    if not cart_item or cart_item.cart_id != cart.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    product = cart_item.product
    if not product or not product.is_active:
        await db.cartitem.delete(where={"id": item_id})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is no longer available"
        )

    if item_in.quantity > product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity ({item_in.quantity}) exceeds available stock ({product.stock_quantity})"
        )

    await db.cartitem.update(
        where={"id": item_id},
        data={"quantity": item_in.quantity}
    )

    return await sync_and_format_cart(cart.id, current_user.id)

@router.delete("/items/{item_id}", response_model=CartOut)
async def remove_item_from_cart(
    item_id: int,
    current_user=Depends(get_current_user)
):
    """Remove a specific item from the shopping cart."""
    cart = await get_or_create_user_cart(current_user.id)

    cart_item = await db.cartitem.find_unique(where={"id": item_id})
    if not cart_item or cart_item.cart_id != cart.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    await db.cartitem.delete(where={"id": item_id})
    return await sync_and_format_cart(cart.id, current_user.id)

@router.delete("/clear", response_model=CartOut)
async def clear_cart(current_user=Depends(get_current_user)):
    """Empty all items from the shopping cart."""
    cart = await get_or_create_user_cart(current_user.id)
    await db.cartitem.delete_many(where={"cart_id": cart.id})
    return await sync_and_format_cart(cart.id, current_user.id)
