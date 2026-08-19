from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
import jwt
from app.core.config import settings

def hash_password(password: str) -> str:
    """Hashes a plain text password using bcrypt directly."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a bcrypt hash."""
    pwd_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return str(encoded_jwt)

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and verifies a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def create_email_verification_token(email: str) -> str:
    """Generates a signed JWT for email verification (valid for 24h)."""
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {"sub": email, "purpose": "verify_email", "exp": expire}
    encoded_jwt = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return str(encoded_jwt)

def decode_email_verification_token(token: str) -> Optional[str]:
    """Validates an email verification JWT and returns the email."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("purpose") == "verify_email":
            return payload.get("sub")
        return None
    except jwt.PyJWTError:
        return None

def create_password_reset_token(email: str) -> str:
    """Generates a signed JWT for password reset (valid for 15 mins)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {"sub": email, "purpose": "reset_password", "exp": expire}
    encoded_jwt = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return str(encoded_jwt)

def decode_password_reset_token(token: str) -> Optional[str]:
    """Validates a password reset JWT and returns the email."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("purpose") == "reset_password":
            return payload.get("sub")
        return None
    except jwt.PyJWTError:
        return None

