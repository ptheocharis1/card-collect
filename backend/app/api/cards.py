from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.card_instance import CardInstance
from app.models.user import User
from app.schemas.card import CardCollectionItemRead

router = APIRouter(tags=["cards"])


class CardCreate(BaseModel):
    card_variant_id: int
    condition_type: Optional[str] = None
    raw_condition_estimate: Optional[str] = None
    grader: Optional[str] = None
    grade: Optional[str] = None
    serial_number_observed: Optional[int] = None
    purchase_price: Optional[float] = None
    purchase_date: Optional[str] = None
    purchase_source: Optional[str] = None
    notes: Optional[str] = None


@router.get("/cards", response_model=List[CardCollectionItemRead])
def list_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.execute(
        text(
            """
            SELECT
              ci.id,
              ci.user_id,
              ci.condition_type,
              ci.raw_condition_estimate AS condition_estimate,
              ci.grader,
              ci.grade,
              ci.serial_number_observed,
              ci.purchase_price,
              ci.purchase_date,
              ci.purchase_source,
              ci.notes,
              ci.created_at,
              cc.id AS checklist_card_id,
              cc.card_name,
              cc.player_name,
              cc.team_or_franchise,
              cc.card_number,
              cc.variant_name,
              cc.rookie_card,
              cv.id AS variant_id,
              cv.parallel_name,
              cv.variation_name,
              cv.autograph_flag,
              cv.autograph_type,
              cv.relic_flag,
              cv.patch_flag,
              cv.relic_type,
              cv.serial_total,
              p.id AS product_id,
              p.year,
              p.manufacturer,
              p.brand,
              p.product_name,
              p.sport_or_universe,
              p.release_type,
              p.release_date
            FROM card_instances ci
            JOIN card_variants cv ON ci.card_variant_id = cv.id
            JOIN checklist_cards cc ON cv.checklist_card_id = cc.id
            JOIN products p ON cc.product_id = p.id
            WHERE ci.user_id = :user_id
            ORDER BY ci.id DESC
            LIMIT 200
            """
        ),
        {"user_id": current_user.id},
    ).mappings().all()

    return [
        {
            "id": row["id"],
            "user_id": row["user_id"],
            "condition": {
                "type": row["condition_type"],
                "estimate": row["condition_estimate"],
                "grader": row["grader"],
                "grade": row["grade"],
                "serial_number_observed": row["serial_number_observed"],
            },
            "purchase": {
                "purchase_price": row["purchase_price"],
                "purchase_date": row["purchase_date"],
                "purchase_source": row["purchase_source"],
            },
            "notes": row["notes"],
            "created_at": row["created_at"],
            "card": {
                "id": row["checklist_card_id"],
                "name": row["card_name"],
                "player_name": row["player_name"],
                "team_or_franchise": row["team_or_franchise"],
                "card_number": row["card_number"],
                "variant_name": row["variant_name"],
                "rookie_card": row["rookie_card"],
            },
            "variant": {
                "id": row["variant_id"],
                "parallel_name": row["parallel_name"],
                "variation_name": row["variation_name"],
                "autograph_flag": row["autograph_flag"],
                "autograph_type": row["autograph_type"],
                "relic_flag": row["relic_flag"],
                "patch_flag": row["patch_flag"],
                "relic_type": row["relic_type"],
                "serial_total": row["serial_total"],
            },
            "product": {
                "id": row["product_id"],
                "year": row["year"],
                "manufacturer": row["manufacturer"],
                "brand": row["brand"],
                "product_name": row["product_name"],
                "sport_or_universe": row["sport_or_universe"],
                "release_type": row["release_type"],
                "release_date": row["release_date"],
            },
        }
        for row in rows
    ]


@router.post("/cards", status_code=201)
def create_card(
    payload: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parsed_purchase_date = None
    if payload.purchase_date:
      parsed_purchase_date = date.fromisoformat(payload.purchase_date)

    card = CardInstance(
        user_id=current_user.id,
        card_variant_id=payload.card_variant_id,
        condition_type=payload.condition_type,
        condition_estimate=payload.raw_condition_estimate,
        grader=payload.grader,
        grade=payload.grade,
        serial_number_observed=(
            str(payload.serial_number_observed)
            if payload.serial_number_observed is not None
            else None
        ),
        purchase_price=payload.purchase_price,
        purchase_date=parsed_purchase_date,
        purchase_source=payload.purchase_source,
        notes=payload.notes,
        created_at=datetime.now(timezone.utc),
    )

    db.add(card)
    db.commit()
    db.refresh(card)

    return {
        "id": card.id,
        "user_id": card.user_id,
        "card_variant_id": card.card_variant_id,
    }