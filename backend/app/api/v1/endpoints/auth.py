from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.schemas.auth import Token
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app import schemas, models
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import hash_password


router = APIRouter()



@router.post("/login/user", response_model=Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Truy vấn user từ database
    user = db.query(models.user.User).filter(models.user.User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    role = user.role
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": "user"}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=schemas.auth.UserOut)
def register(user_data: schemas.auth.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if db.query(models.user.User).filter(models.user.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.user.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/update-profile")
def update_profile(
    form_data: OAuth2PasswordRequestForm = Depends(),  # username + old_password
    new_password: str = Form(None),                    # optional                    # optional
    db: Session = Depends(get_db)
):
    # Lấy user từ DB
    user = db.query(models.user.User).filter(models.user.User.username == form_data.username).first()

    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    # Kiểm tra mật khẩu cũ
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng")

    # Cập nhật mật khẩu mới nếu có
    if new_password:
        user.hashed_password = hash_password(new_password)


    db.commit()
    db.refresh(user)

    return user