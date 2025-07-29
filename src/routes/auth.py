from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_current_user
from src.models.user import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'اسم المستخدم وكلمة المرور مطلوبان'}), 400

        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401

        if not user.is_active:
            return jsonify({'error': 'الحساب غير مفعل'}), 401

        access_token = create_access_token(identity=user)
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(),
            'message': 'تم تسجيل الدخول بنجاح'
        }), 200

    except Exception as e:
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        phone = data.get('phone')

        if not username or not email or not password:
            return jsonify({'error': 'اسم المستخدم والبريد الإلكتروني وكلمة المرور مطلوبة'}), 400

        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'اسم المستخدم موجود بالفعل'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'البريد الإلكتروني موجود بالفعل'}), 400

        # Create new user
        new_user = User(
            username=username,
            email=email,
            full_name=full_name,
            phone=phone,
            role='member'  # Default role
        )
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=new_user)

        return jsonify({
            'access_token': access_token,
            'user': new_user.to_dict(),
            'message': 'تم إنشاء الحساب بنجاح'
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user = get_current_user()
        return jsonify({
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile"""
    try:
        current_user = get_current_user()
        data = request.get_json()

        # Update allowed fields
        if 'full_name' in data:
            current_user.full_name = data['full_name']
        if 'phone' in data:
            current_user.phone = data['phone']
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != current_user.id:
                return jsonify({'error': 'البريد الإلكتروني موجود بالفعل'}), 400
            current_user.email = data['email']

        db.session.commit()

        return jsonify({
            'user': current_user.to_dict(),
            'message': 'تم تحديث الملف الشخصي بنجاح'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user = get_current_user()
        data = request.get_json()

        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({'error': 'كلمة المرور الحالية والجديدة مطلوبتان'}), 400

        if not current_user.check_password(current_password):
            return jsonify({'error': 'كلمة المرور الحالية غير صحيحة'}), 400

        current_user.set_password(new_password)
        db.session.commit()

        return jsonify({'message': 'تم تغيير كلمة المرور بنجاح'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ في الخادم'}), 500

