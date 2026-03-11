from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.product import Product
from app.models.checklist_card import ChecklistCard
from app.models.card_variant import CardVariant

from app.schemas.product import ProductRead, ProductCreate
from app.schemas.checklist_card import ChecklistCardRead, ChecklistCardCreate
from app.schemas.card_variant import CardVariantRead, CardVariantCreate

from app.dependencies.auth import require_catalog_manager

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/products", response_model=List[ProductRead])
def list_products(db: Session = Depends(get_db)):
    return (
        db.query(Product)
        .order_by(Product.year.desc(), Product.product_name.asc())
        .all()
    )


@router.get("/products/{product_id}/cards", response_model=List[ChecklistCardRead])
def list_checklist_cards(product_id: int, db: Session = Depends(get_db)):
    return (
        db.query(ChecklistCard)
        .filter(ChecklistCard.product_id == product_id)
        .order_by(ChecklistCard.card_number.asc())
        .all()
    )


@router.get("/cards/{card_id}/variants", response_model=List[CardVariantRead])
def list_card_variants(card_id: int, db: Session = Depends(get_db)):
    return (
        db.query(CardVariant)
        .filter(CardVariant.checklist_card_id == card_id)
        .order_by(CardVariant.parallel_name.asc())
        .all()
    )


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_catalog_manager),
):
    def norm(value: str | None) -> str:
        return (value or "").strip().lower()

    existing_products = db.query(Product).all()

    for existing in existing_products:
        if (
            (existing.year or 0) == (payload.year or 0)
            and norm(existing.manufacturer) == norm(payload.manufacturer)
            and norm(existing.brand) == norm(payload.brand)
            and norm(existing.product_name) == norm(payload.product_name)
            and norm(existing.sport_or_universe) == norm(payload.sport_or_universe)
            and norm(existing.release_type) == norm(payload.release_type)
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A matching product already exists in the catalog",
            )

    product = Product(**payload.model_dump())

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.post("/products/{product_id}/cards", response_model=ChecklistCardRead, status_code=status.HTTP_201_CREATED)
def create_checklist_card(
    product_id: int,
    payload: ChecklistCardCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_catalog_manager),
):
    def norm(value: str | None) -> str:
        return (value or "").strip().lower()

    existing_cards = (
        db.query(ChecklistCard)
        .filter(ChecklistCard.product_id == product_id)
        .all()
    )

    for existing in existing_cards:
        if (
            norm(existing.card_number) == norm(payload.card_number)
            and norm(existing.player_name) == norm(payload.player_name)
            and norm(existing.card_name) == norm(payload.card_name)
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A matching checklist card already exists for this product",
            )

    card = ChecklistCard(
        product_id=product_id,
        **payload.model_dump(),
    )

    db.add(card)
    db.commit()
    db.refresh(card)

    return card


@router.post("/cards/{card_id}/variants", response_model=CardVariantRead, status_code=status.HTTP_201_CREATED)
def create_variant(
    card_id: int,
    payload: CardVariantCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_catalog_manager),
):
    def norm(value: str | None) -> str:
        return (value or "").strip().lower()

    existing_variants = (
        db.query(CardVariant)
        .filter(CardVariant.checklist_card_id == card_id)
        .all()
    )

    for existing in existing_variants:
        if (
            norm(existing.parallel_name) == norm(payload.parallel_name)
            and norm(existing.variation_name) == norm(payload.variation_name)
            and bool(existing.autograph_flag) == bool(payload.autograph_flag)
            and norm(existing.autograph_type) == norm(payload.autograph_type)
            and bool(existing.relic_flag) == bool(payload.relic_flag)
            and bool(existing.patch_flag) == bool(payload.patch_flag)
            and norm(existing.relic_type) == norm(payload.relic_type)
            and (existing.serial_total or 0) == (payload.serial_total or 0)
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A matching variant already exists for this checklist card",
            )

    variant = CardVariant(
        checklist_card_id=card_id,
        **payload.model_dump(),
    )

    db.add(variant)
    db.commit()
    db.refresh(variant)

    return variant