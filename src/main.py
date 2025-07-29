import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from src.models.user import db, User
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.reports import reports_bp
from src.routes.settings import settings_bp
from src.routes.sharing import sharing_bp
from src.routes.activation import activation_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Tokens don't expire for demo

# Enable CORS for all routes
CORS(app, origins="*")

# Initialize JWT
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(reports_bp, url_prefix='/api/reports')
app.register_blueprint(settings_bp)
app.register_blueprint(sharing_bp)
app.register_blueprint(activation_bp)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# JWT user loader
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()

# Create tables and default admin user
with app.app_context():
    db.create_all()
    
    # Import all models to ensure they're created
    from src.models.activation import ActivationCode, UserActivation, Comment, CommentLike, Notification
    from src.models.settings import SiteSettings, Participant, Activity, Attendance
    db.create_all()
    
    # Create default admin user if not exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            email='admin@scoutteam.sa',
            role='admin',
            full_name='مدير النظام',
            phone='+966501234567',
            is_activated=True  # Admin is pre-activated
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        db.session.commit()
        print("Default admin user created: admin/admin123")
        
        # Create a default activation code
        default_code = ActivationCode(
            description='كود التفعيل الافتراضي',
            max_uses=100,
            created_by=admin_user.id
        )
        db.session.add(default_code)
        db.session.commit()
        print(f"Default activation code created: {default_code.code}")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

