from fastapi import APIRouter, HTTPException, status
from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import create_access_token  # Giả sử bạn để hàm tạo token trong đây

router = APIRouter()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM  # Nên lấy từ config luôn

@router.post("/token/refresh")
def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Tạo access token mới với user_id lấy từ refresh token
        access_token = create_access_token({"sub": user_id})
        return {"access_token": access_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")