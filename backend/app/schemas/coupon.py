from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class DiscountTypeEnum(str, Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"

class CouponCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=30, description="Coupon code, e.g. SUMMER25")
    description: Optional[str] = Field(None, max_length=255)
    discount_type: DiscountTypeEnum = Field(DiscountTypeEnum.PERCENTAGE)
    discount_value: float = Field(..., gt=0, description="Percentage (e.g. 10) or Flat Amount (e.g. 20)")
    min_order_amount: float = Field(0.0, ge=0, description="Minimum cart subtotal required to apply")
    is_active: bool = Field(True)
    starts_at: Optional[datetime] = Field(None, description="Start Date for coupon activation")
    expires_at: Optional[datetime] = Field(None, description="Expiration Date for coupon validity")

    @field_validator("code")
    @classmethod
    def uppercase_code(cls, v: str) -> str:
        return v.strip().upper()

class CouponUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=2, max_length=30)
    description: Optional[str] = None
    discount_type: Optional[DiscountTypeEnum] = None
    discount_value: Optional[float] = Field(None, gt=0)
    min_order_amount: Optional[float] = Field(None, ge=0)
    is_active: Optional[bool] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    @field_validator("code")
    @classmethod
    def uppercase_code(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().upper() if v else None

class CouponOut(BaseModel):
    id: int
    code: str
    description: Optional[str] = None
    discount_type: DiscountTypeEnum
    discount_value: float
    min_order_amount: float
    is_active: bool
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class CouponValidateIn(BaseModel):
    code: str = Field(..., min_length=1)
    subtotal: float = Field(..., ge=0)

class CouponValidateOut(BaseModel):
    valid: bool
    code: str
    discount_type: str
    discount_value: float
    discount_amount: float
    message: str
