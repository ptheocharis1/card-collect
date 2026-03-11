from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ChecklistCardBase(BaseModel):
    player_name: Optional[str] = None
    team_or_franchise: Optional[str] = None
    card_number: Optional[str] = None
    card_name: Optional[str] = None
    variant_name: Optional[str] = None
    rookie_card: Optional[bool] = None


class ChecklistCardCreate(ChecklistCardBase):
    pass


class ChecklistCardRead(ChecklistCardBase):
    id: int
    product_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)