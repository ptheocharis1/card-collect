from pydantic import BaseModel, ConfigDict


class CollectionItemCreate(BaseModel):
    card_variant_id: int
    quantity: int = 1


class CollectionItemUpdate(BaseModel):
    quantity: int


class CollectionItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    collection_id: int
    card_variant_id: int
    quantity: int