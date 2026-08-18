from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import db
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    UserOut,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    UpdateProfileRequest,
    MessageResponse
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_email_verification_token,
    decode_email_verification_token,
    create_password_reset_token,
    decode_password_reset_token
)
from app.dependencies.auth import get_current_user
from app.services.email import (
    send_verification_email,
    send_password_reset_email
)
from prisma.models import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserRegister):
    """Registers a new user, generates a stateless verification token, and sends an email link."""
    # Step 1: Check if email is already registered
    existing_user = await db.user.find_unique(where={"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # Step 2: Hash password & create user in PostgreSQL
    hashed_pwd = hash_password(user_in.password)
    new_user = await db.user.create(
        data={
            "email": user_in.email,
            "password_hash": hashed_pwd,
            "first_name": user_in.first_name,
            "last_name": user_in.last_name,
            "is_verified": False,
        }
    )
    
    # Step 3: Create an empty Cart for the new user
    await db.cart.create(data={"user_id": new_user.id})
    
    # Step 4: Generate stateless JWT verification token & send email
    verification_token = create_email_verification_token(new_user.email)
    send_verification_email(new_user.email, verification_token)
    
    return {"message": "Registration successful! Please check your email to verify your account."}

@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(req: ForgotPasswordRequest):
    """Resends email verification link to an unverified user."""
    user = await db.user.find_unique(where={"email": req.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account with this email does not exist."
        )
    if user.is_verified:
        return {"message": "Account is already verified. You can log in directly."}
    
    verification_token = create_email_verification_token(user.email)
    send_verification_email(user.email, verification_token)
    return {"message": "Verification link has been resent to your email address."}

@router.get("/verify-email", response_model=MessageResponse)
async def verify_email(token: str):
    """Verifies user email address using the stateless JWT token."""
    email = decode_email_verification_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    user = await db.user.find_unique(where={"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Update user as verified
    await db.user.update(
        where={"id": user.id},
        data={"is_verified": True}
    )
    
    return {"message": "Email verified successfully! You can now log in."}

@router.post("/login", response_model=Token)
async def login_user(user_in: UserLogin):
    """Authenticates user credentials and checks if email is verified."""
    user = await db.user.find_unique(where={"email": user_in.email})
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    # Block login if user email is not verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your email address before logging in."
        )
        
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(req: ForgotPasswordRequest):
    """Generates a stateless password reset JWT token and sends link to user's email."""
    user = await db.user.find_unique(where={"email": req.email})
    if user:
        reset_token = create_password_reset_token(user.email)
        send_password_reset_email(user.email, reset_token)
        
    return {"message": "If an account with that email exists, a password reset link has been sent to your email."}

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(req: ResetPasswordRequest):
    """Resets user password using the stateless reset JWT token."""
    email = decode_password_reset_token(req.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
        
    user = await db.user.find_unique(where={"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    new_hashed_pwd = hash_password(req.new_password)
    
    await db.user.update(
        where={"id": user.id},
        data={"password_hash": new_hashed_pwd}
    )
    
    return {"message": "Password reset successfully! You can now log in with your new password."}

@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user)
):
    """Allows an authenticated user to change their password."""
    # Verify current old password
    if not verify_password(req.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password entered is incorrect."
        )
        
    new_hashed_pwd = hash_password(req.new_password)
    await db.user.update(
        where={"id": current_user.id},
        data={"password_hash": new_hashed_pwd}
    )
    return {"message": "Password changed successfully!"}

@router.put("/profile", response_model=UserOut)
async def update_profile(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user)
):
    """Updates user profile information."""
    updated_user = await db.user.update(
        where={"id": current_user.id},
        data={
            "first_name": req.first_name,
            "last_name": req.last_name
        }
    )
    return updated_user

@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Returns profile details of the current logged-in user (Protected route)."""
    return current_user
