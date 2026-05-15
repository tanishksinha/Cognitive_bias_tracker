from sqlalchemy import Column, Integer, Boolean, ForeignKey
from app.core.database import Base


class DecisionOutcome(Base):
    __tablename__ = "decision_outcomes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(
        Integer,
        ForeignKey("decisions.decision_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    satisfaction_score = Column(Integer, nullable=True)   # 1–5
    would_decide_same = Column(Boolean, nullable=True)
