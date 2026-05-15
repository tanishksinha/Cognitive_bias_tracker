from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True)
    password_hash = Column(String(255))
    decision_count = Column(Integer, default=0)
    calibration_phase = Column(String(50), default="baseline")
    is_verified = Column(Boolean, default=False)