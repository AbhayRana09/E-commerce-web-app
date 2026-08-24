import re
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

def validate_password_complexity(password: str) -> str:
    """Enforces industrial password complexity rules."""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter (A-Z).")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter (a-z).")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one number (0-9).")
    return password


class UserRegister(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64, description="Must be 8-64 characters")
    first_name: str = Field(..., min_length=2, max_length=30)
    last_name: str = Field(..., min_length=1, max_length=30)

    @field_validator("email", mode="before")
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("first_name", "last_name", mode="before")
    def sanitize_names(cls, v: str) -> str:
        if isinstance(v, str):
            clean = v.strip()
            if not clean:
                raise ValueError("Name cannot consist only of whitespace.")
            if re.search(r"^\s|\s$|\s{2,}", v):
                raise ValueError("No leading, trailing, or consecutive spaces allowed.")
            if not re.match(r"^[A-Za-z]+(?:\s[A-Za-z]+)*$", clean):
                raise ValueError("Name can only contain alphabetic characters and single spaces.")
            return clean
        return v

    @field_validator("password")
    def check_password_strength(cls, v: str) -> str:
        return validate_password_complexity(v)

class UserLogin(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=64)

    @field_validator("email", mode="before")
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    is_verified: bool
    created_at: datetime

class ForgotPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr

    @field_validator("email", mode="before")
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=64)

    @field_validator("new_password")
    def check_new_password_strength(cls, v: str) -> str:
        return validate_password_complexity(v)

class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=64)

    @field_validator("new_password")
    def check_new_password_strength(cls, v: str) -> str:
        return validate_password_complexity(v)

class UpdateProfileRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first_name: str = Field(..., min_length=2, max_length=30)
    last_name: str = Field(..., min_length=1, max_length=30)

    @field_validator("first_name", "last_name", mode="before")
    def sanitize_names(cls, v: str) -> str:
        if isinstance(v, str):
            clean = v.strip()
            if not clean:
                raise ValueError("Name cannot consist only of whitespace.")
            if re.search(r"^\s|\s$|\s{2,}", v):
                raise ValueError("No leading, trailing, or consecutive spaces allowed.")
            if not re.match(r"^[A-Za-z]+(?:\s[A-Za-z]+)*$", clean):
                raise ValueError("Name can only contain alphabetic characters and single spaces.")
            return clean
        return v

class MessageResponse(BaseModel):
    message: str
