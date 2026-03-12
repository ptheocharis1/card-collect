from sqlalchemy import text
from app.db.database import SessionLocal


TABLES_TO_CLEAR = [
    "collection_items",
    "collections",
    "card_instances",
    "card_variants",
    "checklist_cards",
    "products",
]


def reset_database():
    db = SessionLocal()

    try:
        print("Starting database reset...")

        db.execute(
            text(
                f"""
                TRUNCATE TABLE {', '.join(TABLES_TO_CLEAR)}
                RESTART IDENTITY CASCADE
                """
            )
        )

        db.commit()

        print("Database reset complete.")
        print("Cleared tables:")
        for t in TABLES_TO_CLEAR:
            print(f"  - {t}")

    except Exception as e:
        db.rollback()
        print("Reset failed:", e)

    finally:
        db.close()


if __name__ == "__main__":
    reset_database()