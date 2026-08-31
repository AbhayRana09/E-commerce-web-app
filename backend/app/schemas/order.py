from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.coupon import CouponOut

class OrderStatusEnum(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class OrderStatusUpdate(BaseModel):
    status: OrderStatusEnum

class OrderCreateIn(BaseModel):
    address_id: int
    coupon_code: Optional[str] = None
    payment_method: str = Field("MOCK_CARD")

class OrderSimulatePaymentIn(BaseModel):
    payment_method: str = Field("MOCK_CARD")
    simulate_success: bool = True

class OrderCancelIn(BaseModel):
    reason: Optional[str] = Field(None, max_length=100)

class OrderItemProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    price: float
    image_url: Optional[str] = None

class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    product_id: int
    price_at_purchase: float
    quantity: int
    created_at: datetime
    product: Optional[OrderItemProductOut] = None

class OrderUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: str
    last_name: str

class OrderAddressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    street: str
    city: str
    state: str
    postal_code: str
    country: str

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    address_id: int
    coupon_id: Optional[int] = None
    status: OrderStatusEnum
    payment_method: str
    payment_status: str
    subtotal: float
    shipping_cost: float
    discount: float
    tax_amount: float
    total_amount: float
    confirmed_at: Optional[datetime] = None
    processing_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[OrderUserOut] = None
    address: Optional[OrderAddressOut] = None
    coupon: Optional[CouponOut] = None
    items: Optional[List[OrderItemOut]] = []

class OrderPaginatedOut(BaseModel):
    items: List[OrderOut]
    total: int
    page: int
    limit: int
    total_pages: int

class RecentOrderSummary(BaseModel):
    id: int
    customer_name: str
    customer_email: str
    status: OrderStatusEnum
    items_count: int
    total_amount: float
    created_at: datetime

class AdminStatsOut(BaseModel):
    total_products: int
    active_products: int
    out_of_stock: int
    total_categories: int
    total_customers: int
    total_orders: int
    total_sales: float
    recent_orders: List[RecentOrderSummary]
