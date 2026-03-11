from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CardVariantBase(BaseModel):
    parallel_name: Optional[str] = None
    variation_name: Optional[str] = None
    autograph_flag: Optional[bool] = None
    autograph_type: Optional[str] = None
    relic_flag: Optional[bool] = None
    patch_flag: Optional[bool] = None
    relic_type: Optional[str] = None
    serial_total: Optional[int] = None


class CardVariantCreate(CardVariantBase):
    pass


class CardVariantRead(CardVariantBase):
    id: int
    checklist_card_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)