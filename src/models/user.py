from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='member')  # admin, full_editor, leader, member
    full_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    is_activated = db.Column(db.Boolean, default=False)  # New field for activation status

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)

    def has_permission(self, required_role):
        """Check if user has required permission level"""
        role_hierarchy = {'member': 1, 'leader': 2, 'full_editor': 3, 'admin': 4}
        user_level = role_hierarchy.get(self.role, 0)
        required_level = role_hierarchy.get(required_role, 0)
        return user_level >= required_level

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'is_activated': self.is_activated
        }

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False)  # budget, issue, schedule
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    data = db.Column(db.JSON, nullable=True)  # Store structured data as JSON
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    creator = db.relationship('User', backref=db.backref('reports', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'title': self.title,
            'content': self.content,
            'data': self.data,
            'created_by': self.created_by,
            'creator_name': self.creator.username if self.creator else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }

