import re
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional

def validate_postal_code(postal_code: str) -> str:
    """Validates postal code format using regex."""
    clean = postal_code.strip()
    if not re.match(r"^[a-zA-Z0-9\s\-]{3,15}$", clean):
        raise ValueError("Invalid postal code format.")
    return clean

class AddressCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    street: str = Field(..., min_length=1, max_length=150)
    city: str = Field(..., min_length=1, max_length=50)
    state: str = Field(..., min_length=1, max_length=50)
    postal_code: str = Field(..., min_length=3, max_length=15)
    country: str = Field(..., min_length=2, max_length=60)
    is_default: Optional[bool] = False

    @field_validator("street", "city", "state", "country", mode="before")
    def sanitize_strings(cls, v: str) -> str:
        if isinstance(v, str):
            clean = v.strip()
            if not clean:
                raise ValueError("Address fields cannot consist only of whitespace.")
            return clean
        return v

    @field_validator("postal_code")
    def check_postal_code(cls, v: str) -> str:
        return validate_postal_code(v)

class AddressUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    street: Optional[str] = Field(None, min_length=1, max_length=150)
    city: Optional[str] = Field(None, min_length=1, max_length=50)
    state: Optional[str] = Field(None, min_length=1, max_length=50)
    postal_code: Optional[str] = Field(None, min_length=3, max_length=15)
    country: Optional[str] = Field(None, min_length=2, max_length=60)
    is_default: Optional[bool] = None

    @field_validator("street", "city", "state", "country", mode="before")
    def sanitize_optional_strings(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            clean = v.strip()
            if not clean:
                raise ValueError("Field cannot be empty whitespace.")
            return clean
        return v

    @field_validator("postal_code")
    def check_postal_code(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_postal_code(v)
        return v

class AddressOut(BaseModel):
    id: int
    user_id: int
    street: str
    city: str
    state: str
    postal_code: str
    country: str
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True

