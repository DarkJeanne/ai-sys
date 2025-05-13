FROM python:3.10-slim

# Cài các thư viện hệ thống cần thiết
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    pkg-config \
    libmariadb-dev \
    libmariadb-dev-compat \
    libgl1 \
    libglib2.0-0 \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Tạo thư mục làm việc
WORKDIR /app

# Cài các thư viện Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn
COPY . .

# Expose cổng chạy FastAPI
EXPOSE 8000

# Lệnh khởi động server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
