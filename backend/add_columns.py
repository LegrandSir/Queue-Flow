from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(100)"))
        db.session.commit()
        print("✅ Column 'full_name' added.")
    except Exception as e:
        print(f"⚠️ Could not add full_name: {e}")

    try:
        db.session.execute(text("ALTER TABLE users ADD COLUMN id_number VARCHAR(50)"))
        db.session.commit()
        print("✅ Column 'id_number' added.")
    except Exception as e:
        print(f"⚠️ Could not add id_number: {e}")