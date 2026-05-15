# models/user_profile.py

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from app.core.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)

    crt_score = Column(Float)
    bnt_score = Column(Float)
    nfc_score = Column(Float)
    aot_score = Column(Float)
    max_score = Column(Float)

    # Tracks when the questionnaire was last completed — used to enforce the
    # 90-day minimum retest interval.
    completed_at = Column(DateTime, nullable=True)
