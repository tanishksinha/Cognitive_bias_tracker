# models/option_ratings.py
from sqlalchemy import Column, Integer, ForeignKey
from app.core.database import Base

class OptionRating(Base):
    __tablename__ = "option_ratings"

    id = Column(Integer, primary_key=True)
    option_id = Column(Integer, ForeignKey("options.option_id"))
    factor_id = Column(Integer, ForeignKey("factors.factor_id"))

    rating = Column(Integer)  # 1–10