from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()
db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__)

    db_url = os.getenv('DATABASE_URL', 'sqlite:///queue.db')
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from .routes import main
    app.register_blueprint(main)

    # Auto-initialize tables & seed demo data if empty (great for Render free tier)
    with app.app_context():
        from .seed import seed_demo_data
        try:
            seed_demo_data(reset_tickets=False)
        except Exception as e:
            print(f"Auto-seed skipped/deferred: {e}")

    return app