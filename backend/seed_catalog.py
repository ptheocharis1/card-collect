from datetime import date

from app.db.database import SessionLocal
from app.models.card_variant import CardVariant
from app.models.checklist_card import ChecklistCard
from app.models.product import Product


def main():
    db = SessionLocal()

    try:
        existing = db.query(Product).count()
        if existing > 0:
            print("Catalog already seeded.")
            return

        product = Product(
            year=2024,
            manufacturer="Panini",
            brand="Prizm",
            product_name="2024 Panini Prizm NBA",
            sport_or_universe="NBA",
            release_type="hobby",
            release_date=date(2024, 10, 2),
        )
        db.add(product)
        db.flush()

        wemby = ChecklistCard(
            product_id=product.id,
            player_name="Victor Wembanyama",
            team_or_franchise="San Antonio Spurs",
            card_number="101",
            card_name="Victor Wembanyama",
            variant_name="Base",
            rookie_card=True,
        )
        ant = ChecklistCard(
            product_id=product.id,
            player_name="Anthony Edwards",
            team_or_franchise="Minnesota Timberwolves",
            card_number="55",
            card_name="Anthony Edwards",
            variant_name="Base",
            rookie_card=False,
        )
        luka = ChecklistCard(
            product_id=product.id,
            player_name="Luka Doncic",
            team_or_franchise="Dallas Mavericks",
            card_number="12",
            card_name="Luka Doncic",
            variant_name="Base",
            rookie_card=False,
        )

        db.add_all([wemby, ant, luka])
        db.flush()

        variants = [
            CardVariant(
                checklist_card_id=wemby.id,
                parallel_name="Base",
                autograph_flag=False,
                relic_flag=False,
                patch_flag=False,
            ),
            CardVariant(
                checklist_card_id=wemby.id,
                parallel_name="Silver",
                autograph_flag=False,
                relic_flag=False,
                patch_flag=False,
            ),
            CardVariant(
                checklist_card_id=wemby.id,
                parallel_name="Green",
                autograph_flag=False,
                relic_flag=False,
                patch_flag=False,
            ),
            CardVariant(
                checklist_card_id=wemby.id,
                parallel_name="Gold",
                autograph_flag=False,
                relic_flag=False,
                patch_flag=False,
                serial_total=10,
            ),
            CardVariant(
                checklist_card_id=ant.id,
                parallel_name="Base",
                autograph_flag=False,
                relic_flag=False,
                patch_flag=False,
            ),
            CardVariant(
                checklist_card_id=ant.id,
                parallel_name="Silver",
                autograph_flag=False,
                relic_flag=False,
                patch_flag=False,
            ),
            CardVariant(
                checklist_card_id=luka.id,
                parallel_name="Base",
                autograph_flag=False,
                relic_flag=False,
                patch_flag=False,
            ),
            CardVariant(
                checklist_card_id=luka.id,
                parallel_name="Silver",
                autograph_flag=False,
                relic_flag=False,
                patch_flag=False,
            ),
        ]

        db.add_all(variants)
        db.commit()
        print("Catalog seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()