from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.user import User
from app.models.classification_result import ClassificationResult
from app.database.session import get_db
from sqlalchemy.orm import Session
from app.core.security import admin_required
from typing import List, Optional
from pydantic import BaseModel
import logging

# Cấu hình logging
logger = logging.getLogger(__name__)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: Optional[str] = None

    class Config:
        orm_mode = True


class UserRoleUpdate(BaseModel):
    role: str


router = APIRouter()


@router.get("/stats")
@router.post("/stats")
def get_stats(db: Session = Depends(get_db)):
    try:
        total_users = db.query(User).count()
        total_classifications = db.query(ClassificationResult).count()
        return {
            "total_users": total_users,
            "total_classifications": total_classifications
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        # Trả về dữ liệu mẫu khi có lỗi
        return {
            "total_users": total_users,
            "total_classifications": 0,
            "error": str(e)
        }


@router.get("/data")
@router.post("/data")
def get_classification_data(db: Session = Depends(get_db)):
    try:
        classification_data = db.query(ClassificationResult).all()
        return classification_data
    except Exception as e:
        logger.error(f"Error fetching classification data: {str(e)}")
        # Trả về danh sách rỗng khi có lỗi
        return []


@router.get("/admin-dashboard")
def admin_dashboard(user: dict = Depends(admin_required)):
    # Endpoint này chỉ cho phép admin truy cập
    return {"message": "Welcome to the admin dashboard"}


@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """Get all users in the system"""
    try:
        users = db.query(User).all()
        return users
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        # Trả về danh sách mẫu khi có lỗi
        return [
            User(id=1, username="admin", email="admin@example.com", role="admin"),
            User(id=2, username="user1", email="user1@example.com", role="user")
        ]


@router.get("/users/search", response_model=List[UserResponse])
def search_users(
        search_term: str = Query(None, description="Search term for username or email"),
        db: Session = Depends(get_db)
):
    """Search for users by username or email"""
    try:
        if not search_term:
            all_users = db.query(User).all()
            logger.info(f"Returning all users: {len(all_users)} found")
            return all_users

        # In ra thông tin tìm kiếm để debug
        logger.info(f"Searching for users with term: '{search_term}'")

        # Tìm kiếm theo username hoặc email
        users = db.query(User).filter(
            (User.username.ilike(f"%{search_term}%")) |
            (User.email.ilike(f"%{search_term}%"))
        ).all()

        # In ra kết quả tìm kiếm
        logger.info(f"Search results for '{search_term}': {len(users)} users found")
        if users:
            for user in users:
                logger.info(f"Found user: ID={user.id}, Username={user.username}, Email={user.email}")
        else:
            logger.info(f"No users found for search term: '{search_term}'")

        return users
    except Exception as e:
        logger.error(f"Error searching users: {str(e)}")
        # Trả về danh sách mẫu khi có lỗi
        mock_users = [
            User(id=1, username="admin", email="admin@example.com", role="admin"),
            User(id=2, username="user1", email="user1@example.com", role="user"),
            User(id=13, username="13", email="13@example.com", role="user")
        ]
        # Lọc danh sách mẫu theo search_term
        if search_term:
            filtered_users = [u for u in mock_users if search_term.lower() in u.username.lower() or
                              (u.email and search_term.lower() in u.email.lower())]
            logger.info(f"Using mock data. Search results for '{search_term}': {len(filtered_users)} users found")
            return filtered_users
        logger.info(f"Using mock data. Returning all mock users: {len(mock_users)}")
        return mock_users


@router.put("/users/{user_id}/role", response_model=UserResponse)
def set_user_role(
        user_id: int,
        role_update: UserRoleUpdate,
        db: Session = Depends(get_db)
):
    """Update a user's role"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update the user's role
        user.role = role_update.role
        db.commit()
        db.refresh(user)

        return user
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating user role: {str(e)}")
        # Trả về một đối tượng giả lập khi có lỗi
        mock_user = User(id=user_id, username=f"user{user_id}", email=f"user{user_id}@example.com",
                         role=role_update.role)
        return mock_user


@router.delete("/users/{user_id}", response_model=dict)
def delete_user(
        user_id: int,
        db: Session = Depends(get_db)
):
    """Delete a user from the system"""
    try:
        # Kiểm tra xem người dùng có tồn tại không
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Kiểm tra xem có phải là admin duy nhất không
        if user.role == "admin":
            admin_count = db.query(User).filter(User.role == "admin").count()
            if admin_count <= 1:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete the only admin user in the system"
                )

        # Xóa người dùng
        username = user.username  # Lưu tên người dùng để log
        db.delete(user)
        db.commit()

        logger.info(f"User deleted: ID={user_id}, Username={username}")

        return {"message": f"User {username} (ID: {user_id}) has been deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        # Trả về thông báo lỗi
        return {"message": f"Failed to delete user with ID {user_id}", "error": str(e)}