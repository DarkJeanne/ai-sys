from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< Updated upstream
from app.api.v1.endpoints import classify, auth, admin  # Đảm bảo các file này được định nghĩa đúng
# from app.database._init_db import _init_db  # Comment phần khởi tạo database
from app.core.logger import get_logger  # Import get_logger thay vì setup_logging
=======
from app.api.v1.endpoints import classify, auth, admin
from app.database._init_db import _init_db
from app.core.logger import get_logger
>>>>>>> Stashed changes

# Tạo ứng dụng FastAPI
app = FastAPI()

# Cấu hình logger
logger = get_logger(__name__)

<<<<<<< Updated upstream
# Khởi tạo cơ sở dữ liệu
# _init_db()  # Comment phần khởi tạo database
=======
# Khởi tạo cơ sở dữ liệu khi startup
@app.on_event("startup")
def on_startup():
    logger.info("Initializing database schema…")
    _init_db()
    logger.info("Database initialized.")
>>>>>>> Stashed changes

# Đăng ký các router của API
app.include_router(classify.router, prefix="/classify", tags=["classification"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

# CORS middleware (cho dev, allow all origin)
app.add_middleware(
    CORSMiddleware,
<<<<<<< Updated upstream
    allow_origins=[
        "http://localhost:4173",  # Dùng đúng cổng frontend
        "http://127.0.0.1:4173"   # Optionally: thêm cả 127.0.0.1
    ],
=======
    allow_origins=["*"],             # hoặc ["http://localhost:4173"] nếu bạn muốn giới hạn
>>>>>>> Stashed changes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi động ứng dụng với uvicorn
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI application...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
