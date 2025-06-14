import pytest
from httpx import AsyncClient
from app.main import app  # hoặc đường dẫn đúng tới FastAPI app

@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Đăng ký
        register_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass"
        }
        res = await ac.post("/auth/register", json=register_data)
        assert res.status_code == 200 or res.status_code == 400

        # Đăng nhập
        login_data = {
            "username": "testuser",
            "password": "testpass"
        }
        res = await ac.post("/auth/login/user", data=login_data)
        assert res.status_code == 200
        assert "access_token" in res.json()
