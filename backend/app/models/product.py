from sqlalchemy import Column, Date, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=True)
    manufacturer = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    product_name = Column(String, nullable=True)
    sport_or_universe = Column(String, nullable=True)
    release_type = Column(String, nullable=True)
    release_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    checklist_cards = relationship("ChecklistCard", back_populates="product")