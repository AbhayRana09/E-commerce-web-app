from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=30, description="Category name (2 to 30 characters)")
    description: Optional[str] = Field(None, max_length=300, description="Category description (maximum 300 characters)")

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=30, description="Category name (2 to 30 characters)")
    description: Optional[str] = Field(None, max_length=300, description="Category description (maximum 300 characters)")

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
