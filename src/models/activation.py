from src.database import db
from src.models.user import User, Report
from datetime import datetime, timedelta
import secrets
import string

class ActivationCode(db.Model):
    __tablename__ = 'activation_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    max_uses = db.Column(db.Integer, default=1)
    current_uses = db.Column(db.Integer, default=0)
    expires_at = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to track which users used this code
    activations = db.relationship('UserActivation', backref='activation_code', lazy=True)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.code:
            self.code = self.generate_code()
    
    @staticmethod
    def generate_code(length=8):
        """Generate a random activation code"""
        characters = string.ascii_uppercase + string.digits
        # Exclude confusing characters
        characters = characters.replace('0', '').replace('O', '').replace('1', '').replace('I', '')
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    def is_valid(self):
        """Check if the activation code is valid for use"""
        if not self.is_active:
            return False, "الكود غير نشط"
        
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return False, "انتهت صلاحية الكود"
        
        if self.current_uses >= self.max_uses:
            return False, "تم استخدام الكود بالحد الأقصى المسموح"
        
        return True, "الكود صالح للاستخدام"
    
    def use_code(self, user_id):
        """Use the activation code for a user"""
        is_valid, message = self.is_valid()
        if not is_valid:
            return False, message
        
        # Check if user already used this code
        existing_activation = UserActivation.query.filter_by(
            user_id=user_id, 
            activation_code_id=self.id
        ).first()
        
        if existing_activation:
            return False, "تم استخدام هذا الكود مسبقاً لهذا المستخدم"
        
        # Create activation record
        activation = UserActivation(
            user_id=user_id,
            activation_code_id=self.id,
            used_at=datetime.utcnow()
        )
        
        self.current_uses += 1
        
        try:
            db.session.add(activation)
            db.session.commit()
            return True, "تم تفعيل الحساب بنجاح"
        except Exception as e:
            db.session.rollback()
            return False, f"حدث خطأ في التفعيل: {str(e)}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'description': self.description,
            'max_uses': self.max_uses,
            'current_uses': self.current_uses,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'remaining_uses': self.max_uses - self.current_uses
        }

class UserActivation(db.Model):
    __tablename__ = 'user_activations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    activation_code_id = db.Column(db.Integer, db.ForeignKey('activation_codes.id'), nullable=False)
    used_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='activations', foreign_keys=[user_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activation_code_id': self.activation_code_id,
            'used_at': self.used_at.isoformat() if self.used_at else None,
            'user_name': self.user.username if self.user else None,
            'activation_code': self.activation_code.code if self.activation_code else None
        }

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    report_id = db.Column(db.Integer, db.ForeignKey('report.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=True)  # For replies
    likes_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='comments', foreign_keys=[user_id])
    report = db.relationship('Report', backref='comments', foreign_keys=[report_id])
    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]))
    likes = db.relationship('CommentLike', backref='comment', lazy=True)
    
    def to_dict(self, include_replies=True):
        return {
            'id': self.id,
            'content': self.content,
            'report_id': self.report_id,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else None,
            'user_full_name': self.user.full_name if self.user else None,
            'parent_id': self.parent_id,
            'likes_count': self.likes_count,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'replies': [reply.to_dict(include_replies=False) for reply in self.replies] if include_replies else []
        }

class CommentLike(db.Model):
    __tablename__ = 'comment_likes'
    
    id = db.Column(db.Integer, primary_key=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate likes
    __table_args__ = (db.UniqueConstraint('comment_id', 'user_id', name='unique_comment_like'),)
    
    user = db.relationship('User', backref='comment_likes', foreign_keys=[user_id])

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # comment, like, report, system
    related_id = db.Column(db.Integer, nullable=True)  # ID of related object (report, comment, etc.)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='notifications', foreign_keys=[user_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'related_id': self.related_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

