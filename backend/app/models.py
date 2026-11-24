from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import pytz


def get_kenya_time():
    """Return current Nairobi (EAT) time as naive datetime for consistent SQL storage."""
    tz = pytz.timezone('Africa/Nairobi')
    return datetime.now(tz).replace(tzinfo=None)


class Role(db.Model):
    __tablename__ = 'roles'
    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), nullable=False, unique=True)


class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id'))
    counter = db.Column(db.String(50), nullable=True)
    full_name = db.Column(db.String(100), nullable=True)
    id_number = db.Column(db.String(50), nullable=True)
    role = db.relationship('Role', backref='users')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.user_id,
            'email': self.email,
            'role': self.role.role_name if self.role else 'Staff',
            'full_name': self.full_name or self.email.split('@')[0].title(),
            'id_number': self.id_number,
            'counter': self.counter or 'Counter 1',
        }


class Ticket(db.Model):
    __tablename__ = 'tickets'
    ticket_id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(10), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='waiting')  # waiting | serving | completed | missed
    priority_level = db.Column(db.Integer, default=0)     # 0 = standard, 1 = priority
    counter = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=get_kenya_time)
    called_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=get_kenya_time, onupdate=get_kenya_time)

    def to_dict(self):
        return {
            'id': self.ticket_id,
            'ticket_number': self.ticket_number,
            'service_type': self.service_type,
            'status': self.status,
            'priority_level': self.priority_level,
            'counter': self.counter,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'called_at': self.called_at.isoformat() if self.called_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }


class SystemSetting(db.Model):
    __tablename__ = 'system_settings'
    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(50), unique=True, nullable=False)
    setting_value = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=get_kenya_time)
    updated_at = db.Column(db.DateTime, default=get_kenya_time, onupdate=get_kenya_time)


class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    duration_minutes = db.Column(db.Integer, default=10)
    active = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime, default=get_kenya_time, onupdate=get_kenya_time)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'duration': self.duration_minutes,
            'active': self.active,
        }