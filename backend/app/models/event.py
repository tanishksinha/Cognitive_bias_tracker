from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from app.core.database import Base
import datetime

class DecisionEvent(Base):
    __tablename__ = "decision_events"

    event_id = Column(Integer, primary_key=True)
    decision_id = Column(Integer, ForeignKey("decisions.decision_id"))

    event_type = Column(String(100))
    event_payload = Column(JSON)

    occurred_at = Column(DateTime, default=datetime.datetime.utcnow)