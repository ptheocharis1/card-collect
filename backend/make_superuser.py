from app.db.database import SessionLocal
from app.models.user import User

db = SessionLocal()

users = db.query(User).all()

print("Existing users:")
for u in users:
    print(u.id, u.email, u.is_superuser)

email = "test@test.com"

user = db.query(User).filter(User.email == email).first()

if not user:
    print("User not found with that email.")
else:
    user.is_superuser = True
    db.commit()
    print("User promoted to superuser:", user.email)