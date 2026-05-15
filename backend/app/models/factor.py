from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.core.database import Base

class Factor(Base):
    __tablename__ = "factors"

    factor_id = Column(Integer, primary_key=True)
    decision_id = Column(Integer, ForeignKey("decisions.decision_id"))

    label = Column(String(255))
    weight = Column(Float)

    weight_initial = Column(Float)  # REQUIRED