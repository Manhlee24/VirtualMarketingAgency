from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from schemas.auth import UserCreate, UserLogin, UserOut, Token, TokenLogin
from models.user import User
from db import get_db, init_db
from core.auth import get_password_hash, verify_password, create_access_token

router = APIRouter()


# @router.on_event("startup")
# def _init_db():
#     # Create tables automatically when the app starts (helpful for dev).
#     try:
#         init_db()
#     except Exception as e:
#         # If DB not available at startup, app will still run but endpoints will error until DB is ready.
#         print(f"init_db warning: {e}")
# api/router.py

# api/router.py

@router.on_event("startup")
def _init_db():
    print("Attempting to initialize database tables...")
    init_db()
    print("Database tables initialized successfully.")


@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with hashed password."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = get_password_hash(user_in.password)
    user = User(email=user_in.email, name=user_in.name, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token = create_access_token(
        {"user_id": user.email}, expires_delta=timedelta(minutes=60 * 24))
    return {"access_token": access_token, "token_type": "bearer", "message": "Đăng kí thành công!"}


@router.post("/login", response_model=TokenLogin)
def login(form_data: UserLogin, db: Session = Depends(get_db)):
    """Simple login that returns a JWT when credentials are valid.

    Note: Using the same UserCreate schema for simplicity. In production use OAuth2PasswordRequestForm or a dedicated Login schema.
    """
    user = db.query(User).filter(User.email == form_data.email).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(
        {"user_id": user.email}, expires_delta=timedelta(minutes=60 * 24))
    return {"access_token": access_token, "token_type": "bearer", "message": "Đăng nhập thành công!", "name": user.name}
