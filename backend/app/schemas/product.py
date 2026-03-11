from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    year: Optional[int] = None
    manufacturer: Optional[str] = None
    brand: Optional[str] = None
    product_name: Optional[str] = None
    sport_or_universe: Optional[str] = None
    release_type: Optional[str] = None
    release_date: Optional[date] = None


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)