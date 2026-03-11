from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api.auth import router as auth_router
from app.api.collections import router as collections_router
from app.api.collection_items import router as collection_items_router

import app.models  # important: registers all SQLAlchemy models

from app.api.catalog import router as catalog_router
from app.api.cards import router as cards_router

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(catalog_router)
app.include_router(cards_router)
app.include_router(collections_router)
app.include_router(collection_items_router)

@app.get("/health")
def health():
    return {"status": "ok"}