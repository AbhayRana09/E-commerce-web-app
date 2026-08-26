from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

# Payload for creating a new review
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")
    comment: Optional[str] = Field(None, max_length=1000, description="Optional text feedback")

# Payload for updating an existing review
class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)

# Reviewer user info
class ReviewUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str

# Review output model
class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    product_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[ReviewUserOut] = None

# 5-Star breakdown model
class StarBreakdown(BaseModel):
    star_5: int = 0
    star_4: int = 0
    star_3: int = 0
    star_2: int = 0
    star_1: int = 0

# Overall product review summary
class ProductReviewResponse(BaseModel):
    average_rating: float
    total_reviews: int
    breakdown: StarBreakdown
    can_review: bool = False
    has_purchased: bool = False
    user_review: Optional[ReviewOut] = None
    reviews: List[ReviewOut] = []
