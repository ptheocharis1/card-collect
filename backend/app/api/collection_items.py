from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.card_variant import CardVariant
from app.models.collection import Collection
from app.models.collection_item import CollectionItem
from app.models.user import User
from app.schemas.collection_item import (
    CollectionItemCreate,
    CollectionItemRead,
    CollectionItemUpdate,
)

router = APIRouter(tags=["collection-items"])


@router.post(
    "/collections/{collection_id}/items",
    response_model=CollectionItemRead,
    status_code=status.HTTP_201_CREATED,
)
def add_collection_item(
    collection_id: int,
    payload: CollectionItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collection = (
        db.query(Collection)
        .filter(Collection.id == collection_id, Collection.user_id == current_user.id)
        .first()
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    card_variant = (
        db.query(CardVariant)
        .filter(CardVariant.id == payload.card_variant_id)
        .first()
    )
    if not card_variant:
        raise HTTPException(status_code=404, detail="Card variant not found")

    existing_item = (
        db.query(CollectionItem)
        .filter(
            CollectionItem.collection_id == collection_id,
            CollectionItem.card_variant_id == payload.card_variant_id,
        )
        .first()
    )

    if existing_item:
        existing_item.quantity += payload.quantity
        db.commit()
        return (
            db.query(CollectionItem)
            .options(joinedload(CollectionItem.card_variant))
            .filter(CollectionItem.id == existing_item.id)
            .first()
        )

    item = CollectionItem(
        collection_id=collection_id,
        card_variant_id=payload.card_variant_id,
        quantity=payload.quantity,
    )
    db.add(item)
    db.commit()

    return (
        db.query(CollectionItem)
        .options(joinedload(CollectionItem.card_variant))
        .filter(
            CollectionItem.collection_id == collection_id,
            CollectionItem.card_variant_id == payload.card_variant_id,
        )
        .first()
    )


@router.get("/collections/{collection_id}/items")
def list_collection_items(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collection = (
        db.query(Collection)
        .filter(Collection.id == collection_id, Collection.user_id == current_user.id)
        .first()
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    rows = db.execute(
        text(
            """
            SELECT
                ci.id,
                ci.collection_id,
                ci.quantity,

                cv.id AS variant_id,
                cv.parallel_name,
                cv.variation_name,
                cv.autograph_flag,
                cv.autograph_type,
                cv.relic_flag,
                cv.patch_flag,
                cv.relic_type,
                cv.serial_total,

                cc.id AS card_id,
                cc.card_name,
                cc.player_name,
                cc.team_or_franchise,
                cc.card_number,
                cc.variant_name,
                cc.rookie_card,

                p.id AS product_id,
                p.year,
                p.manufacturer,
                p.brand,
                p.product_name,
                p.sport_or_universe,
                p.release_type,
                p.release_date

            FROM collection_items ci
            JOIN card_variants cv ON ci.card_variant_id = cv.id
            JOIN checklist_cards cc ON cv.checklist_card_id = cc.id
            JOIN products p ON cc.product_id = p.id
            WHERE ci.collection_id = :collection_id
            ORDER BY p.year DESC, cc.player_name ASC, cc.card_number ASC
            """
        ),
        {"collection_id": collection_id},
    ).mappings().all()

    return [
        {
            "id": row["id"],
            "collection_id": row["collection_id"],
            "quantity": row["quantity"],
            "card": {
                "id": row["card_id"],
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


@router.patch("/collection-items/{item_id}", response_model=CollectionItemRead)
def update_collection_item(
    item_id: int,
    payload: CollectionItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(CollectionItem)
        .join(Collection, Collection.id == CollectionItem.collection_id)
        .filter(CollectionItem.id == item_id, Collection.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Collection item not found")

    item.quantity = payload.quantity
    db.commit()

    return (
        db.query(CollectionItem)
        .options(joinedload(CollectionItem.card_variant))
        .filter(CollectionItem.id == item_id)
        .first()
    )


@router.delete("/collection-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(CollectionItem)
        .join(Collection, Collection.id == CollectionItem.collection_id)
        .filter(CollectionItem.id == item_id, Collection.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Collection item not found")

    db.delete(item)
    db.commit()