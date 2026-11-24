from app import create_app
from app.seed import seed_demo_data

app = create_app()

with app.app_context():
    seed_demo_data(reset_tickets=True)
    print("✅ QueueFlow database seeded!")
    print("   Admin Demo: admin@queueflow.io / Admin123!")
    print("   Staff Demo: staff@queueflow.io / Staff123!")