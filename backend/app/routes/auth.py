import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, constr
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
    create_token,
    create_verification_token,
    decode_verification_token,
)
from app.core.email_utils import send_verification_email
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/auth")


class AuthData(BaseModel):
    email: EmailStr
    password: constr(min_length=8)


class EmailData(BaseModel):
    email: EmailStr


class TokenData(BaseModel):
    token: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def build_verification_link(token: str) -> str:
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return f"{frontend_url}/verify-email?token={token}"


@router.post("/register")
def register(data: AuthData, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    verification_token = create_verification_token(user.user_id)
    verification_link = build_verification_link(verification_token)
    email_sent = send_verification_email(user.email, verification_link)

    return {"message": "Account created. Check your email to verify your account."}


@router.post("/login")
def login(data: AuthData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email is not verified")

    token = create_token({"user_id": user.user_id})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/verify-email")
def verify_email(data: TokenData, db: Session = Depends(get_db)):
    user_id = decode_verification_token(data.token)
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email already verified"}

    user.is_verified = True
    db.add(user)
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification(data: EmailData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email is already verified"}

    verification_token = create_verification_token(user.user_id)
    verification_link = build_verification_link(verification_token)
    email_sent = send_verification_email(user.email, verification_link)

    return {"message": "Verification email resent."}


@router.delete("/account")
def delete_account(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Deletes the current user's account and all associated data.
    SQLite cascading will handle linked decisions and profile.
    """
    db.delete(user)
    db.commit()
    return {"message": "Account deleted successfully"}
