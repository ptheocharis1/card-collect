from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.collection import Collection
from app.models.user import User
from app.schemas.collection import CollectionCreate, CollectionRead

router = APIRouter(prefix="/collections", tags=["collections"])


@router.post("/", response_model=CollectionRead)
def create_collection(
    payload: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collection = Collection(
        name=payload.name,
        user_id=current_user.id,
    )

    db.add(collection)
    db.commit()
    db.refresh(collection)

    return collection


@router.get("/", response_model=list[CollectionRead])
def list_collections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Collection)
        .filter(Collection.user_id == current_user.id)
        .all()
    )


@router.get("/{collection_id}")
def get_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collection = (
        db.query(Collection)
        .filter(
            Collection.id == collection_id,
            Collection.user_id == current_user.id,
        )
        .first()
    )

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    return {
        "id": collection.id,
        "name": collection.name,
    }