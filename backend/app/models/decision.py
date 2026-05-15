from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.core.database import Base
import datetime

class Decision(Base):
    __tablename__ = "decisions"

    decision_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))

    title = Column(String(255))
    description = Column(String(1000))

    initial_preference_option_id = Column(Integer, nullable=True)
    final_choice_option_id = Column(Integer, nullable=True)

    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)