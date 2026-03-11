from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CardInstanceCreate(BaseModel):
    card_variant_id: int
    condition_type: str = "raw"
    raw_condition_estimate: Optional[str] = None
    grader: Optional[str] = None
    grade: Optional[str] = None
    serial_number_observed: Optional[int] = None
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[date] = None
    purchase_source: Optional[str] = None
    notes: Optional[str] = None


class CardInstanceRead(CardInstanceCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)