from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Role(db.Model):
    __tablename__ = 'roles'
    __table_args__ = {'extend_existing': True}
    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), nullable=False)

class Ticket(db.Model):
    __tablename__ = 'tickets'
    __table_args__ = {'extend_existing': True}
    ticket_id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(10), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='waiting') 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id'))
    
    role = db.relationship('Role', backref='users')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class SystemSetting(db.Model):
    __tablename__ = 'system_settings'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(50), unique=True, nullable=False) # e.g., 'max_wait_time'
    setting_value = db.Column(db.String(100), nullable=False) # e.g., '15'
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)