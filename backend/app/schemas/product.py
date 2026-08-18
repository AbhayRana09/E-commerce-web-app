from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.category import CategoryOut

class ProductCreate(BaseModel):
    category_id: int
    name: str
    description: str
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(..., ge=0)
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    image_url: Optional[str] = None

class ProductOut(BaseModel):
    id: int
    category_id: int
    name: str
    slug: str
    description: str
    price: float
    stock_quantity: int
    is_active: bool
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryOut] = None

    class Config:
        from_attributes = True

class ProductPaginatedOut(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    limit: int
    total_pages: int
