import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_admin_stats_requires_admin():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test khi không truyền token admin
        res = await ac.post("/admin/stats")
        assert res.status_code in (401, 403)  # Tùy cấu hình admin_required

@pytest.mark.asyncio
async def test_admin_dashboard_denied_for_normal_user():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Không có token => từ chối truy cập
        res = await ac.get("/admin/admin-dashboard")
        assert res.status_code in (401, 403)
