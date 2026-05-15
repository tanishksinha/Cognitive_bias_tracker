# models/option.py
from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class Option(Base):
    __tablename__ = "options"

    option_id = Column(Integer, primary_key=True)
    decision_id = Column(Integer, ForeignKey("decisions.decision_id"))

    label = Column(String(255))
    position = Column(Integer)