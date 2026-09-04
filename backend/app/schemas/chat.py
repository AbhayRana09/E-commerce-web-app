from typing import Optional, List, Literal
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1, description="List of previous conversation messages")
    scope: Literal["catalog", "orders"] = Field(..., description="'catalog' for product recommendations or 'orders' for user order tracking")
    context_id: Optional[int] = Field(None, description="Optional product_id or order_id if user is focusing on a specific item")

class ProductRecommendationOut(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    image_url: Optional[str] = None
    category_name: Optional[str] = None
    average_rating: Optional[float] = 0.0
    in_stock: bool = True

class OrderSummaryOut(BaseModel):
    id: int
    status: str
    total_amount: float
    created_at: str
    items_count: int
    items_summary: List[str]

class ChatResponse(BaseModel):
    reply: str
    scope: Literal["catalog", "orders"]
    recommended_products: Optional[List[ProductRecommendationOut]] = None
    order_summaries: Optional[List[OrderSummaryOut]] = None
