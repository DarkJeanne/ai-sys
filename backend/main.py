from fastapi import FastAPI
from app.api.v1.endpoints import classify, auth, admin  # Đảm bảo các file này được định nghĩa đúng
from app.database._init_db import _init_db  # Sửa từ _init_db (bỏ dấu _)
from app.core.logger import get_logger  # Import get_logger thay vì setup_logging

# Tạo ứng dụng FastAPI
app = FastAPI()

# Cấu hình logger
logger = get_logger(__name__)

# Khởi tạo cơ sở dữ liệu
_init_db()

# Đăng ký các router của API
app.include_router(classify.router, prefix="/classify", tags=["classification"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

# Khởi động ứng dụng với uvicorn (có thể chạy từ command line)
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI application...")  # Ghi log khi ứng dụng bắt đầu chạy
    uvicorn.run(app, host="0.0.0.0", port=8000)
