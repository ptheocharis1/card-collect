from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class ChecklistCard(Base):
    __tablename__ = "checklist_cards"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    player_name = Column(String)
    team_or_franchise = Column(String)
    card_number = Column(String)
    card_name = Column(String)
    variant_name = Column(String)
    rookie_card = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    product = relationship("Product", back_populates="checklist_cards")
    variants = relationship("CardVariant", back_populates="checklist_card")