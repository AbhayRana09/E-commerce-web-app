from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.product import ProductOut

class WishlistItemOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    product: ProductOut

    class Config:
        from_attributes = True

class WishlistResponse(BaseModel):
    items: List[WishlistItemOut]
    total_items: int
    product_ids: List[int]
