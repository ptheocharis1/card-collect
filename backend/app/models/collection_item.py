from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.database import Base


class CollectionItem(Base):
    __tablename__ = "collection_items"

    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    card_variant_id = Column(Integer, ForeignKey("card_variants.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    collection = relationship("Collection", back_populates="items")
    card_variant = relationship("CardVariant", back_populates="collection_items")