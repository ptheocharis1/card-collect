from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class CardInstance(Base):
    __tablename__ = "card_instances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    card_variant_id = Column(Integer, ForeignKey("card_variants.id"), nullable=False)

    condition_type = Column(String, nullable=True)
    condition_estimate = Column("raw_condition_estimate", String, nullable=True)
    grader = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    serial_number_observed = Column(String, nullable=True)

    purchase_price = Column(Numeric(10, 2), nullable=True)
    purchase_date = Column(Date, nullable=True)
    purchase_source = Column(String, nullable=True)

    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="card_instances")
    variant = relationship("CardVariant", back_populates="instances")