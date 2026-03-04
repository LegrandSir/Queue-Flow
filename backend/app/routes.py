from flask import Blueprint, request, jsonify, make_response
from .models import Ticket, User, SystemSetting
from . import db
import random
import csv
import io

# Define the blueprint
main = Blueprint('main', __name__)

# --- DIAGNOSTICS ---
@main.route('/api/health', methods=['GET'])
def health_check():
    """Diagnostic route to confirm the backend is reachable."""
    return jsonify({"status": "Backend is pulsing!", "database": "Connected"}), 200

# --- TICKET GENERATION & MOBILE STATUS ---

@main.route('/api/tickets/generate', methods=['POST'])
def generate_ticket():
    data = request.get_json()
    service_name = data.get('service_type')
    
    if not service_name:
        return jsonify({"error": "Service type is required"}), 400

    prefix = "B" 
    ticket_num = f"{prefix}{random.randint(100, 999)}"
    
    try:
        # Count people ahead for dynamic wait time
        count_ahead = Ticket.query.filter_by(
            status='waiting', 
            service_type=service_name
        ).count()

        new_ticket = Ticket(
            ticket_number=ticket_num,
            service_type=service_name,
            status='waiting'
        )
        db.session.add(new_ticket)
        db.session.commit()
        
        return jsonify({
            "ticket_number": ticket_num,
            "service_type": service_name,
            "wait_time": f"{count_ahead * 5} min",
            "people_ahead": count_ahead
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@main.route('/api/tickets/status/<ticket_num>', methods=['GET'])
def get_ticket_status(ticket_num):
    user_ticket = Ticket.query.filter_by(ticket_number=ticket_num).first()
    if not user_ticket:
        return jsonify({"error": "Ticket not found"}), 404

    # Recalculate people ahead based on creation order
    people_ahead = Ticket.query.filter(
        Ticket.status == 'waiting',
        Ticket.service_type == user_ticket.service_type,
        Ticket.created_at < user_ticket.created_at
    ).count()

    serving_now = Ticket.query.filter_by(
        status='serving',
        service_type=user_ticket.service_type
    ).first()

    return jsonify({
        "ticket_number": user_ticket.ticket_number,
        "status": user_ticket.status,
        "service": user_ticket.service_type,
        "people_ahead": people_ahead,
        "currently_serving": serving_now.ticket_number if serving_now else "---"
    }), 200

# --- STAFF DASHBOARD OPERATIONS ---

@main.route('/api/tickets/active', methods=['GET'])
def get_active_tickets():
    """Fetches all waiting tickets for the dashboard list."""
    active_tickets = Ticket.query.filter_by(status='waiting').order_by(Ticket.created_at.asc()).all()
    return jsonify([{
        "id": t.ticket_id,
        "ticket_number": t.ticket_number,
        "service_type": t.service_type,
        "status": t.status,
        "created_at": t.created_at.isoformat()
    } for t in active_tickets]), 200

@main.route('/api/tickets/call-next', methods=['POST'])
def call_next():
    """Moves the next ticket in a specific service queue to 'serving' status."""
    data = request.get_json()
    service_requested = data.get('service') 

    ticket = Ticket.query.filter_by(
        status='waiting', 
        service_type=service_requested
    ).order_by(Ticket.created_at.asc()).first()

    if ticket:
        ticket.status = 'serving'
        db.session.commit()
        return jsonify({
            "message": f"Now serving {ticket.ticket_number}",
            "ticket_number": ticket.ticket_number
        }), 200
    
    return jsonify({"message": f"No tickets in {service_requested} queue"}), 404

# --- AUTHENTICATION ---

@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        role_name = user.role.role_name if user.role else "Staff"
        return jsonify({
            "message": "Login successful",
            "user": { "email": user.email, "role": role_name }
        }), 200
    return jsonify({"message": "Invalid email or password"}), 401

# --- ADMIN SETTINGS & SYSTEM ACTIONS ---

@main.route('/api/settings', methods=['GET'])
def get_settings():
    """Retrieves all system settings for the Admin panel."""
    settings = SystemSetting.query.all()
    return jsonify({s.setting_key: s.setting_value for s in settings}), 200

@main.route('/api/settings/update', methods=['POST'])
def update_setting():
    data = request.get_json()
    try:
        for key, value in data.items():
            setting = SystemSetting.query.filter_by(setting_key=key).first()
            if setting:
                setting.setting_value = str(value)
            else:
                new_setting = SystemSetting(setting_key=key, setting_value=str(value))
                db.session.add(new_setting)
        db.session.commit()
        return jsonify({"message": "Settings updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@main.route('/api/system/clear-cache', methods=['POST'])
def clear_cache():
    """Wipes all tickets to reset the queue state."""
    try:
        db.session.query(Ticket).delete()
        db.session.commit()
        return jsonify({"message": "Queue cache cleared successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@main.route('/api/system/reboot', methods=['POST'])
def reboot_services():
    """Restores default SLA targets."""
    try:
        defaults = {'max_wait_time': '15', 'avg_service_duration': '5-10'}
        for key, val in defaults.items():
            setting = SystemSetting.query.filter_by(setting_key=key).first()
            if setting:
                setting.setting_value = val
        db.session.commit()
        return jsonify({"message": "Services rebooted: Defaults restored"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@main.route('/api/system/export-csv', methods=['GET'])
def export_tickets_csv():
    """Generates a downloadable CSV of all ticket history."""
    try:
        tickets = Ticket.query.all()
        si = io.StringIO()
        cw = csv.writer(si)
        cw.writerow(['ID', 'Ticket Number', 'Service Category', 'Status', 'Generated At'])
        
        for t in tickets:
            cw.writerow([t.ticket_id, t.ticket_number, t.service_type, t.status, t.created_at])
        
        output = make_response(si.getvalue())
        output.headers["Content-Disposition"] = "attachment; filename=officeq_analytics.csv"
        output.headers["Content-type"] = "text/csv"
        return output
    except Exception as e:
        return jsonify({"error": str(e)}), 500