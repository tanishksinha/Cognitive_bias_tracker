from datetime import datetime, timedelta
from typing import Any
from fastapi import HTTPException
from jose import jwt, JWTError
import bcrypt
import os

SECRET_KEY = os.getenv("SECRET_KEY", "changeme-set-a-real-secret-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(data: dict, expires_delta: timedelta | None = None) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def create_verification_token(user_id: int) -> str:
    return create_token({"user_id": user_id, "scope": "email_verify"}, timedelta(hours=24))


def decode_verification_token(token: str) -> int:
    payload = decode_token(token)
    if payload.get("scope") != "email_verify" or "user_id" not in payload:
        raise HTTPException(status_code=401, detail="Invalid verification token")
    return int(payload["user_id"])
