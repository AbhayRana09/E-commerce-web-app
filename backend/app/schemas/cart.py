from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime
from app.schemas.product import ProductOut

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1, description="Quantity to add (minimum 1)")

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, description="New quantity (minimum 1)")

class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cart_id: int
    product_id: int
    quantity: int
    created_at: datetime
    updated_at: datetime
    product: ProductOut

class CartOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    items: List[CartItemOut]
    subtotal: float
    total_items: int
