from flask import Blueprint, request, jsonify, make_response, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
import csv
import io
import uuid
from datetime import datetime, timedelta
from src.database import db
from src.models.user import User, Report
from src.models.settings import Participant, Activity, Attendance

sharing_bp = Blueprint('sharing', __name__)

# Temporary storage for shared links (in production, use Redis or database)
shared_links = {}

def require_permission(required_role):
    def decorator(f):
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or not user.has_permission(required_role):
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

# Report Sharing Routes
@sharing_bp.route('/api/reports/<int:report_id>/share', methods=['POST'])
@jwt_required()
@require_permission('leader')
def create_share_link(report_id):
    """Create a shareable link for a report"""
    current_user_id = get_jwt_identity()
    report = Report.query.get_or_404(report_id)
    
    # Check if user can share this report
    user = User.query.get(current_user_id)
    if not user.has_permission('admin') and report.created_by != current_user_id:
        return jsonify({'error': 'You can only share your own reports'}), 403
    
    data = request.get_json()
    expires_in_hours = data.get('expires_in_hours', 24)  # Default 24 hours
    password = data.get('password')  # Optional password protection
    
    # Generate unique share token
    share_token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
    
    # Store share link info
    shared_links[share_token] = {
        'type': 'report',
        'report_id': report_id,
        'created_by': current_user_id,
        'expires_at': expires_at,
        'password': password,
        'access_count': 0,
        'max_access': data.get('max_access', 100)  # Default max 100 accesses
    }
    
    share_url = f"/shared/{share_token}"
    
    return jsonify({
        'message': 'Share link created successfully',
        'share_url': share_url,
        'share_token': share_token,
        'expires_at': expires_at.isoformat(),
        'password_protected': bool(password)
    })

@sharing_bp.route('/api/shared/<share_token>', methods=['GET', 'POST'])
def access_shared_content(share_token):
    """Access shared content via token"""
    if share_token not in shared_links:
        return jsonify({'error': 'Invalid or expired share link'}), 404
    
    share_info = shared_links[share_token]
    
    # Check if link has expired
    if datetime.utcnow() > share_info['expires_at']:
        del shared_links[share_token]
        return jsonify({'error': 'Share link has expired'}), 410
    
    # Check access limit
    if share_info['access_count'] >= share_info['max_access']:
        return jsonify({'error': 'Share link access limit exceeded'}), 429
    
    # Handle password protection
    if share_info.get('password'):
        if request.method == 'GET':
            return jsonify({'password_required': True})
        
        data = request.get_json()
        if not data or data.get('password') != share_info['password']:
            return jsonify({'error': 'Invalid password'}), 401
    
    # Increment access count
    share_info['access_count'] += 1
    
    # Return content based on type
    if share_info['type'] == 'report':
        report = Report.query.get(share_info['report_id'])
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        return jsonify({
            'type': 'report',
            'data': report.to_dict(),
            'access_info': {
                'access_count': share_info['access_count'],
                'max_access': share_info['max_access'],
                'expires_at': share_info['expires_at'].isoformat()
            }
        })
    
    return jsonify({'error': 'Unknown content type'}), 400

# Export Routes
@sharing_bp.route('/api/reports/export', methods=['POST'])
@jwt_required()
@require_permission('leader')
def export_reports():
    """Export reports in various formats"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    export_format = data.get('format', 'json')  # json, csv, txt
    report_ids = data.get('report_ids', [])
    include_data = data.get('include_data', True)
    
    # Get reports
    if report_ids:
        reports = Report.query.filter(Report.id.in_(report_ids), Report.is_active == True).all()
    else:
        reports = Report.query.filter_by(is_active=True).all()
    
    # Filter reports user can access
    user = User.query.get(current_user_id)
    if not user.has_permission('admin'):
        reports = [r for r in reports if r.created_by == current_user_id]
    
    if export_format == 'json':
        export_data = []
        for report in reports:
            report_dict = report.to_dict()
            if not include_data:
                report_dict.pop('data', None)
            export_data.append(report_dict)
        
        output = io.StringIO()
        json.dump(export_data, output, ensure_ascii=False, indent=2)
        output.seek(0)
        
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reports_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        return response
    
    elif export_format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        headers = ['ID', 'Type', 'Title', 'Content', 'Creator', 'Created At', 'Updated At']
        writer.writerow(headers)
        
        # Write data
        for report in reports:
            writer.writerow([
                report.id,
                report.type,
                report.title,
                report.content or '',
                report.creator.username if report.creator else '',
                report.created_at.isoformat() if report.created_at else '',
                report.updated_at.isoformat() if report.updated_at else ''
            ])
        
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reports_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        return response
    
    elif export_format == 'txt':
        output = io.StringIO()
        
        for i, report in enumerate(reports):
            if i > 0:
                output.write('\n' + '='*50 + '\n\n')
            
            output.write(f"تقرير #{report.id}\n")
            output.write(f"النوع: {report.type}\n")
            output.write(f"العنوان: {report.title}\n")
            output.write(f"المنشئ: {report.creator.username if report.creator else 'غير معروف'}\n")
            output.write(f"تاريخ الإنشاء: {report.created_at.strftime('%Y-%m-%d %H:%M') if report.created_at else 'غير محدد'}\n")
            output.write(f"\nالمحتوى:\n{report.content or 'لا يوجد محتوى'}\n")
        
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/plain; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reports_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'
        return response
    
    return jsonify({'error': 'Unsupported export format'}), 400

@sharing_bp.route('/api/participants/export', methods=['POST'])
@jwt_required()
@require_permission('leader')
def export_participants():
    """Export participants data"""
    data = request.get_json()
    export_format = data.get('format', 'csv')  # csv, json
    include_medical = data.get('include_medical', False)
    
    participants = Participant.query.filter_by(status='active').all()
    
    if export_format == 'json':
        export_data = []
        for participant in participants:
            participant_dict = participant.to_dict()
            if not include_medical:
                participant_dict.pop('medical_info', None)
            export_data.append(participant_dict)
        
        output = io.StringIO()
        json.dump(export_data, output, ensure_ascii=False, indent=2)
        output.seek(0)
        
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=participants_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        return response
    
    elif export_format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        headers = ['ID', 'Name', 'Email', 'Phone', 'Age', 'Role', 'Join Date', 'Emergency Contact', 'Emergency Phone']
        if include_medical:
            headers.append('Medical Info')
        writer.writerow(headers)
        
        # Write data
        for participant in participants:
            row = [
                participant.id,
                participant.name,
                participant.email or '',
                participant.phone or '',
                participant.age or '',
                participant.role or '',
                participant.join_date.isoformat() if participant.join_date else '',
                participant.emergency_contact or '',
                participant.emergency_phone or ''
            ]
            if include_medical:
                row.append(participant.medical_info or '')
            writer.writerow(row)
        
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=participants_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        return response
    
    return jsonify({'error': 'Unsupported export format'}), 400

# Print-friendly Routes
@sharing_bp.route('/api/reports/<int:report_id>/print', methods=['GET'])
@jwt_required()
@require_permission('leader')
def get_print_report(report_id):
    """Get report in print-friendly format"""
    current_user_id = get_jwt_identity()
    report = Report.query.get_or_404(report_id)
    
    # Check permissions
    user = User.query.get(current_user_id)
    if not user.has_permission('admin') and report.created_by != current_user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    # Generate print-friendly HTML
    html_content = f"""
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>{report.title}</title>
        <style>
            body {{ font-family: 'Arial', sans-serif; margin: 20px; line-height: 1.6; }}
            .header {{ text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }}
            .title {{ font-size: 24px; font-weight: bold; color: #2d5016; }}
            .meta {{ color: #666; font-size: 14px; margin: 10px 0; }}
            .content {{ margin: 20px 0; }}
            .footer {{ margin-top: 30px; text-align: center; font-size: 12px; color: #999; }}
            @media print {{ body {{ margin: 0; }} }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">{report.title}</div>
            <div class="meta">
                النوع: {report.type} | 
                المنشئ: {report.creator.username if report.creator else 'غير معروف'} | 
                التاريخ: {report.created_at.strftime('%Y-%m-%d %H:%M') if report.created_at else 'غير محدد'}
            </div>
        </div>
        <div class="content">
            {report.content or 'لا يوجد محتوى'}
        </div>
        <div class="footer">
            تم إنشاء هذا التقرير من موقع فريق الكشافة - {datetime.now().strftime('%Y-%m-%d %H:%M')}
        </div>
    </body>
    </html>
    """
    
    response = make_response(html_content)
    response.headers['Content-Type'] = 'text/html; charset=utf-8'
    return response

# Email Sharing (placeholder for future implementation)
@sharing_bp.route('/api/reports/<int:report_id>/email', methods=['POST'])
@jwt_required()
@require_permission('leader')
def email_report(report_id):
    """Send report via email (placeholder)"""
    # This would integrate with an email service like SendGrid, AWS SES, etc.
    data = request.get_json()
    recipients = data.get('recipients', [])
    subject = data.get('subject', 'تقرير من فريق الكشافة')
    message = data.get('message', '')
    
    # For now, just return success message
    return jsonify({
        'message': 'Email functionality not implemented yet',
        'recipients': recipients,
        'subject': subject
    })

# Share link management
@sharing_bp.route('/api/share-links', methods=['GET'])
@jwt_required()
@require_permission('leader')
def get_share_links():
    """Get all share links created by current user"""
    current_user_id = get_jwt_identity()
    
    user_links = []
    for token, info in shared_links.items():
        if info['created_by'] == current_user_id:
            user_links.append({
                'token': token,
                'type': info['type'],
                'expires_at': info['expires_at'].isoformat(),
                'access_count': info['access_count'],
                'max_access': info['max_access'],
                'password_protected': bool(info.get('password'))
            })
    
    return jsonify(user_links)

@sharing_bp.route('/api/share-links/<share_token>', methods=['DELETE'])
@jwt_required()
@require_permission('leader')
def delete_share_link(share_token):
    """Delete a share link"""
    current_user_id = get_jwt_identity()
    
    if share_token not in shared_links:
        return jsonify({'error': 'Share link not found'}), 404
    
    share_info = shared_links[share_token]
    if share_info['created_by'] != current_user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    del shared_links[share_token]
    return jsonify({'message': 'Share link deleted successfully'})

