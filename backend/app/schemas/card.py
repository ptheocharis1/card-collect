from datetime import date as dt_date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CardConditionRead(BaseModel):
    type: Optional[str] = None
    estimate: Optional[str] = None
    grader: Optional[str] = None
    grade: Optional[str] = None
    serial_number_observed: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CardPurchaseRead(BaseModel):
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[dt_date] = None
    purchase_source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChecklistCardRead(BaseModel):
    id: int
    name: Optional[str] = None
    player_name: Optional[str] = None
    team_or_franchise: Optional[str] = None
    card_number: Optional[str] = None
    variant_name: Optional[str] = None
    rookie_card: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)


class CardVariantRead(BaseModel):
    id: int
    parallel_name: Optional[str] = None
    variation_name: Optional[str] = None
    autograph_flag: Optional[bool] = None
    autograph_type: Optional[str] = None
    relic_flag: Optional[bool] = None
    patch_flag: Optional[bool] = None
    relic_type: Optional[str] = None
    serial_total: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class ProductRead(BaseModel):
    id: int
    year: Optional[int] = None
    manufacturer: Optional[str] = None
    brand: Optional[str] = None
    product_name: Optional[str] = None
    sport_or_universe: Optional[str] = None
    release_type: Optional[str] = None
    release_date: Optional[dt_date] = None

    model_config = ConfigDict(from_attributes=True)


class CardCollectionItemRead(BaseModel):
    id: int
    user_id: Optional[int] = None
    condition: CardConditionRead
    purchase: CardPurchaseRead
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    card: ChecklistCardRead
    variant: CardVariantRead
    product: ProductRead

    model_config = ConfigDict(from_attributes=True)