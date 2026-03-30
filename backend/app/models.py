from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import pytz
from datetime import datetime

def get_kenya_time():
    tz = pytz.timezone('Africa/Nairobi')
    return datetime.now(tz)

class Role(db.Model):
    __tablename__ = 'roles'
    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), nullable=False)

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id'))
    counter = db.Column(db.String(50), nullable=True)
    full_name = db.Column(db.String(100), nullable=True)   # new
    id_number = db.Column(db.String(50), nullable=True)    # new
    role = db.relationship(Role, backref='users')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Ticket(db.Model):
    __tablename__ = 'tickets'
    ticket_id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(10), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='waiting')
    priority_level = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=get_kenya_time)

class SystemSetting(db.Model):
    __tablename__ = 'system_settings'
    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(50), unique=True, nullable=False)
    setting_value = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=get_kenya_time)

class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    duration_minutes = db.Column(db.Integer, default=10)
    active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'duration': self.duration_minutes,
            'active': self.active
        }