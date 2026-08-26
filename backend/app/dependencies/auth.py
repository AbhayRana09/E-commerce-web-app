from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from prisma.models import User
from app.core.security import decode_access_token
from app.database import db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """FastAPI Dependency: Extracts and validates current logged-in user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    user = await db.user.find_unique(where={"id": user_id})
    if user is None:
        raise credentials_exception
        
    return user

async def get_optional_user(token: Optional[str] = Depends(oauth2_scheme_optional)) -> Optional[User]:
    """FastAPI Dependency: Extracts logged-in user if token is valid, returns None otherwise without raising 401."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if payload is None:
            return None
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        user_id = int(user_id_str)
        return await db.user.find_unique(where={"id": user_id})
    except Exception:
        return None

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """FastAPI Dependency: Restricts route access strictly to ADMIN users."""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
