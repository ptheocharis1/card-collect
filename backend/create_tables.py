from app.db.database import Base, engine
from app.models.card_instance import CardInstance
from app.models.card_variant import CardVariant
from app.models.checklist_card import ChecklistCard
from app.models.product import Product

Base.metadata.create_all(bind=engine)
print("Tables created successfully.")