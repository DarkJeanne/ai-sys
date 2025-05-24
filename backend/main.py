from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import classify, auth, admin, auth_refresh  # Đảm bảo các file này được định nghĩa đúng
from app.database._init_db import _init_db  # Comment phần khởi tạo database
from app.core.logger import get_logger  # Import get_logger thay vì setup_logging


# Tạo ứng dụng FastAPI
app = FastAPI()
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Cấu hình logger
logger = get_logger(__name__)

# Khởi tạo cơ sở dữ liệu
_init_db()  # Comment phần khởi tạo database

# Đăng ký các router của API
app.include_router(classify.router, prefix="/classify", tags=["classification"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

app.include_router(auth_refresh.router, prefix="/auth_refresh", tags=["auth_refresh"])

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi động ứng dụng với uvicorn (có thể chạy từ command line)
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI application...")  # Ghi log khi ứng dụng bắt đầu chạy
    uvicorn.run(app, host="0.0.0.0", port=8000)