from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class CardVariant(Base):
    __tablename__ = "card_variants"

    id = Column(Integer, primary_key=True, index=True)
    checklist_card_id = Column(Integer, ForeignKey("checklist_cards.id"), nullable=False)

    parallel_name = Column(String, nullable=True)
    variation_name = Column(String, nullable=True)
    autograph_flag = Column(Boolean, nullable=False, default=False)
    autograph_type = Column(String, nullable=True)
    relic_flag = Column(Boolean, nullable=False, default=False)
    patch_flag = Column(Boolean, nullable=False, default=False)
    relic_type = Column(String, nullable=True)
    serial_total = Column(Integer, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    checklist_card = relationship("ChecklistCard", back_populates="variants")
    instances = relationship("CardInstance", back_populates="variant")
    collection_items = relationship("CollectionItem", back_populates="card_variant")