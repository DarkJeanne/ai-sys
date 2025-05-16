# from app.database.session import engine
# from app.models.base import Base
# from app.models import user, classification_result

<<<<<<< Updated upstream
# def _init_db():
#     Base.metadata.create_all(bind=engine)
=======
def _init_db():
    Base.metadata.create_all(bind=engine)
# app/init_db.py
from app.database._init_db import _init_db

if __name__ == "__main__":
    _init_db()
>>>>>>> Stashed changes
