# Stage 1: Build
FROM python:3.10 AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    libmariadb-dev \
    libjpeg-dev \
    zlib1g-dev \
    libffi-dev \
    libgl1 \
    libglib2.0-0 \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime
FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    libmariadb-dev \
    libjpeg-dev \
    zlib1g-dev \
    libffi-dev \
    libgl1 \
    libglib2.0-0 \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]