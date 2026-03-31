from flask import Blueprint, request, jsonify, make_response
from .models import Ticket, User, SystemSetting, Service, Role 
from . import db
import random
import csv
import io
import requests
from datetime import datetime, timedelta
from sqlalchemy import func, extract
from .models import get_kenya_time
from .models import Ticket
from flask import jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity

main = Blueprint('main', __name__)



# --- AI ADMIN INSIGHTS ---

@main.route('/api/admin/ai-insights', methods=['GET'])
def get_ai_insights():
    """Admin Analytics: Generates a LIVE data-driven performance report."""
    try:
        # 1. Fetch only ACTIVE tickets (Waiting or currently being served)
        # This ensures the 'Total Volume' matches your Dashboard dashboard stats
        active_tickets = Ticket.query.filter(Ticket.status.in_(['waiting', 'serving'])).all()
        active_count = len(active_tickets)
        
        # Count specifically those still waiting for the wait-time calculation
        waiting_count = Ticket.query.filter_by(status='waiting').count()

        if active_count == 0:
            return jsonify({
                "insight": "📊 SYSTEM STATUS: Queue is currently empty.\n\nAll departments are clear. This is a great time for staff breaks or administrative tasks."
            }), 200

        # 2. Analyze busiest service based ONLY on active traffic
        service_stats = {}
        for t in active_tickets:
            service_stats[t.service_type] = service_stats.get(t.service_type, 0) + 1

        # Identify the busiest department
        busiest_service = max(service_stats, key=service_stats.get)
        busiest_volume = service_stats[busiest_service]

        # 3. Dynamic logic for recommendations
        recommendation = "Maintain current staffing levels."
        if waiting_count > 5:
            recommendation = f"High demand detected. Reallocate 1 staff member to '{busiest_service}' immediately."
        elif busiest_volume > (active_count * 0.6): # If one service has > 60% of traffic
            recommendation = f"Concentrated traffic in '{busiest_service}'. Consider opening a dedicated express counter."

        # 4. Formulate the Live Report
        report = (
            f"📊 LIVE OPERATIONS SUMMARY\n\n"
            f"• TRAFFIC ANALYSIS: There are currently {active_count} active tickets in the system. "
            f"The '{busiest_service}' department is leading demand with {busiest_volume} active requests.\n\n"
            f"• BOTTLENECK IDENTIFICATION: {waiting_count} customers are currently in the waiting area. "
            f"Based on current flow, the estimated wait is {waiting_count * 5} minutes.\n\n"
            f"• STAFFING RECOMMENDATION: {recommendation}"
        )

        return jsonify({"insight": report}), 200

    except Exception as e:
        print(f"Insight Error: {str(e)}")
        # Fallback response so the UI doesn't break
        return jsonify({"insight": "⚠️ Intelligence module is recalibrating. Please refresh in a moment."}), 200
# --- AI USER CHAT ---

@main.route('/api/user/ai-chat', methods=['POST'])
def user_ai_chat():
    try:
        data = request.get_json()
        t_num = data.get('ticket_number')
        msg = data.get('message', '').lower()

        ticket = Ticket.query.filter_by(ticket_number=t_num).first()
        people_ahead = 0
        service = "General"
        
        if ticket:
            service = ticket.service_type
            people_ahead = Ticket.query.filter(
                Ticket.status == 'waiting', 
                Ticket.service_type == service,
                Ticket.created_at < ticket.created_at
            ).count()

        # Context-Aware Responses
        if any(word in msg for word in ["long", "wait", "time"]):
            wait_min = (people_ahead + 1) * 5
            reply = f"There are currently {people_ahead} people ahead of you. Your estimated wait is {wait_min} minutes."
        elif any(word in msg for word in ["next", "turn", "position"]):
            reply = "You are next!" if people_ahead == 0 else f"You are currently at position {people_ahead + 1} in the {service} queue."
        elif "help" in msg or "hi" in msg or "hello" in msg:
            reply = f"Hello! I'm here to help with your visit. You're in line for {service}."
        else:
            # General fallback that still uses real data
            reply = f"You are currently in the {service} queue with {people_ahead} people ahead of you. Is there anything specific you'd like to know?"

        return jsonify({"reply": reply}), 200

    except Exception as e:
        return jsonify({"reply": "I'm currently updating my queue data. Please check the main display!"}), 200
# --- TICKET GENERATION & MOBILE STATUS ---

@main.route('/api/tickets/generate', methods=['POST'])
def generate_ticket():
    data = request.get_json()
    service_name = data.get('service_type')
    is_priority = data.get('priority', False)
    
    if not service_name:
        return jsonify({"error": "Service type is required"}), 400

    prefix = "P" if is_priority else "B"
    ticket_num = f"{prefix}{random.randint(100, 999)}"
    
    try:
        priority_val = 1 if is_priority else 0
        count_ahead = Ticket.query.filter(
            Ticket.status == 'waiting', 
            Ticket.service_type == service_name, 
            (Ticket.priority_level > priority_val) | 
            ((Ticket.priority_level == priority_val) & (Ticket.created_at < db.func.now()))
        ).count()

        new_ticket = Ticket(
            ticket_number=ticket_num,
            service_type=service_name,
            status='waiting',
            priority_level=priority_val
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

    people_ahead = Ticket.query.filter(
        Ticket.status == 'waiting', 
        Ticket.service_type == user_ticket.service_type
    ).filter(
        (Ticket.priority_level > user_ticket.priority_level) | 
        ((Ticket.priority_level == user_ticket.priority_level) & (Ticket.created_at < user_ticket.created_at))
    ).count()

    serving_now = Ticket.query.filter_by(status='serving', service_type=user_ticket.service_type).first()

    return jsonify({
        "ticket_number": user_ticket.ticket_number,
        "status": user_ticket.status,
        "service": user_ticket.service_type,
        "people_ahead": people_ahead,
        "currently_serving": serving_now.ticket_number if serving_now else "---"
    }), 200

# --- STAFF & DASHBOARD OPERATIONS ---

@main.route('/api/tickets/active', methods=['GET'])
def get_active_tickets():
    # Return waiting AND serving tickets (ordered by priority and time)
    active_tickets = Ticket.query.filter(Ticket.status.in_(['waiting', 'serving']))\
        .order_by(Ticket.priority_level.desc(), Ticket.created_at.asc()).all()
    # ... rest same
    
    return jsonify([{
        "id": t.ticket_id,
        "ticket_number": t.ticket_number,
        "service_type": t.service_type,
        "status": t.status,
        "priority_level": t.priority_level, # CHANGED: Key matches frontend expectations
        "created_at": t.created_at.isoformat()
    } for t in active_tickets]), 200

@main.route('/api/tickets/call-next', methods=['POST'])
def call_next():
    data = request.get_json()
    service_requested = data.get('service') 

    ticket = Ticket.query.filter_by(status='waiting', service_type=service_requested)\
        .order_by(Ticket.priority_level.desc(), Ticket.created_at.asc()).first()

    if ticket:
        ticket.status = 'serving'
        db.session.commit()
        return jsonify({
            "message": f"Now serving {ticket.ticket_number}",
            "ticket_number": ticket.ticket_number
        }), 200
    
    return jsonify({"message": f"No tickets in {service_requested} queue"}), 404

# --- LOGIN & ADMIN ---

@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and user.check_password(data.get('password')):
        role_name = user.role.role_name if user.role else "Staff"
        return jsonify({
            "message": "Login successful",
            "user": { "email": user.email, "role": role_name }
        }), 200
    return jsonify({"message": "Invalid email or password"}), 401

@main.route('/api/system/export-csv', methods=['GET'])
def export_tickets_csv():
    try:
        tickets = Ticket.query.all()
        si = io.StringIO()
        cw = csv.writer(si)
        cw.writerow(['ID', 'Number', 'Service', 'Status', 'Priority', 'Created At'])
        for t in tickets:
            cw.writerow([t.ticket_id, t.ticket_number, t.service_type, t.status, t.priority_level, t.created_at])
        output = make_response(si.getvalue())
        output.headers["Content-Disposition"] = "attachment; filename=report.csv"
        output.headers["Content-type"] = "text/csv"
        return output
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/api/system/clear-cache', methods=['POST'])
def clear_cache():
    try:
        db.session.query(Ticket).delete()
        db.session.commit()
        return jsonify({"message": "Queue cleared"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

# ---- Service Management (temporarily public) ----

@main.route('/api/services', methods=['GET'])
def get_services():
    """List all services (public)."""
    services = Service.query.all()
    return jsonify([s.to_dict() for s in services]), 200


@main.route('/api/services', methods=['POST'])
def add_service():
    """Add a new service (temporarily public)."""
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"error": "Service name required"}), 400
    if Service.query.filter_by(name=name).first():
        return jsonify({"error": "Service already exists"}), 409

    duration = data.get('duration', 10)
    service = Service(name=name, duration_minutes=duration, active=True)
    db.session.add(service)
    db.session.commit()
    return jsonify(service.to_dict()), 201


@main.route('/api/services/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    """Update a service (temporarily public)."""
    service = Service.query.get_or_404(service_id)
    data = request.get_json()
    if 'name' in data:
        # Check uniqueness if name changed
        if data['name'] != service.name and Service.query.filter_by(name=data['name']).first():
            return jsonify({"error": "Service name already exists"}), 409
        service.name = data['name']
    if 'duration' in data:
        service.duration_minutes = data['duration']
    if 'active' in data:
        service.active = data['active']
    db.session.commit()
    return jsonify(service.to_dict()), 200


@main.route('/api/services/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    """Delete a service (temporarily public)."""
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service deleted"}), 200

# ---- Staff Management (temporarily public) ----

@main.route('/api/staff', methods=['GET'])
def get_staff():
    staff_role = Role.query.filter_by(role_name='Staff').first()
    if not staff_role:
        return jsonify([]), 200
    staff_users = User.query.filter_by(role_id=staff_role.role_id).all()
    return jsonify([{
        'id': u.user_id,
        'email': u.email,
        'full_name': u.full_name,
        'id_number': u.id_number,
        'counter': u.counter,
        'active': True
    } for u in staff_users]), 200


@main.route('/api/staff', methods=['POST'])
def add_staff():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    id_number = data.get('id_number')
    counter = data.get('counter')
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    staff_role = Role.query.filter_by(role_name='Staff').first()
    if not staff_role:
        staff_role = Role(role_name='Staff')
        db.session.add(staff_role)
        db.session.commit()

    new_staff = User(email=email, role=staff_role, counter=counter, full_name=full_name, id_number=id_number)
    new_staff.set_password(password)
    db.session.add(new_staff)
    db.session.commit()
    return jsonify({
        'id': new_staff.user_id,
        'email': new_staff.email,
        'full_name': new_staff.full_name,
        'id_number': new_staff.id_number,
        'counter': new_staff.counter
    }), 201


@main.route('/api/staff/<int:staff_id>', methods=['PUT'])
def update_staff(staff_id):
    staff = User.query.get_or_404(staff_id)
    if staff.role.role_name != 'Staff':
        return jsonify({"error": "User is not staff"}), 400
    data = request.get_json()
    if 'email' in data and data['email'] != staff.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already exists"}), 409
        staff.email = data['email']
    if 'full_name' in data:
        staff.full_name = data['full_name']
    if 'id_number' in data:
        staff.id_number = data['id_number']
    if 'counter' in data:
        staff.counter = data['counter']
    if 'password' in data and data['password']:
        staff.set_password(data['password'])
    db.session.commit()
    return jsonify({
        'id': staff.user_id,
        'email': staff.email,
        'full_name': staff.full_name,
        'id_number': staff.id_number,
        'counter': staff.counter
    }), 200


@main.route('/api/staff/<int:staff_id>', methods=['DELETE'])
def delete_staff(staff_id):
    """Delete a staff member."""
    staff = User.query.get_or_404(staff_id)
    if staff.role.role_name != 'Staff':
        return jsonify({"error": "User is not staff"}), 400
    db.session.delete(staff)
    db.session.commit()
    return jsonify({"message": "Staff deleted"}), 200

from .models import SystemSetting   # at the top



@main.route('/api/reports/stats', methods=['GET'])
def get_report_stats():
    """Get ticket statistics for reports."""
    try:
        # Get date range from query params (default last 30 days)
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Total tickets created in period
        total_tickets = Ticket.query.filter(Ticket.created_at >= start_date).count()
        
        # Average wait time (time between created and status='serving')
        # For tickets that have been served
        served_tickets = Ticket.query.filter(
            Ticket.status == 'serving',
            Ticket.created_at >= start_date
        ).all()
        # Note: We don't have a 'served_at' timestamp. We'll estimate based on created_at only.
        # For accurate wait time, you'd need a 'called_at' column. We'll use a placeholder.
        avg_wait_minutes = 0
        if served_tickets:
            # Placeholder: assume each waited 5 min * position? Not accurate. Better to add a 'called_at' column later.
            # For now, return a dummy value.
            avg_wait_minutes = 7.5
        
        # Tickets by day (last 7 days)
        daily_counts = []
        for i in range(7):
            day = datetime.utcnow() - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            count = Ticket.query.filter(
                Ticket.created_at >= day_start,
                Ticket.created_at < day_end
            ).count()
            daily_counts.append({
                'date': day.strftime('%Y-%m-%d'),
                'count': count
            })
        
        # Tickets by service type
        service_counts = db.session.query(
            Ticket.service_type, func.count(Ticket.ticket_id)
        ).filter(Ticket.created_at >= start_date).group_by(Ticket.service_type).all()
        
        service_stats = [{'service': s[0], 'count': s[1]} for s in service_counts]
        
        # Priority vs normal
        priority_count = Ticket.query.filter(
            Ticket.priority_level > 0,
            Ticket.created_at >= start_date
        ).count()
        normal_count = total_tickets - priority_count
        
        return jsonify({
            'total_tickets': total_tickets,
            'avg_wait_minutes': avg_wait_minutes,
            'daily_counts': daily_counts[::-1],  # ascending date order
            'service_stats': service_stats,
            'priority_count': priority_count,
            'normal_count': normal_count,
            'period_days': days
        }), 200
    except Exception as e:
        print(f"Report error: {e}")
        return jsonify({"error": str(e)}), 500
    
@main.route('/api/kiosk/estimate', methods=['GET'])
def get_priority_estimate():
    service = request.args.get('service')
    is_priority = request.args.get('priority', 'false').lower() == 'true'
    if not service:
        return jsonify({"error": "Service required"}), 400

    # Count waiting tickets for this service, with priority logic
    if is_priority:
        # Priority tickets only wait behind other priority tickets
        ahead = Ticket.query.filter(
            Ticket.status == 'waiting',
            Ticket.service_type == service,
            Ticket.priority_level > 0
        ).count()
    else:
        # Normal tickets wait behind both priority and normal tickets
        ahead = Ticket.query.filter(
            Ticket.status == 'waiting',
            Ticket.service_type == service
        ).count()
    wait_minutes = ahead * 5
    return jsonify({"estimated_wait": str(wait_minutes)}), 200

@main.route('/api/reports/efficiency', methods=['GET'])
def get_service_efficiency():
    """Get average handling time per service (mock data for now)."""
    # In a real system, you'd have 'started_at' and 'completed_at' timestamps.
    # For now, we'll return simulated data based on service durations.
    services = Service.query.filter_by(active=True).all()
    efficiency = []
    for svc in services:
        # Simulated average handling time (could be based on actual data later)
        avg_time = svc.duration_minutes
        # Number of tickets served for this service (status='serving')
        served_count = Ticket.query.filter_by(service_type=svc.name, status='serving').count()
        efficiency.append({
            'service': svc.name,
            'avg_handling_minutes': avg_time,
            'served_count': served_count
        })
    return jsonify(efficiency), 200

@main.route('/api/tickets/<int:ticket_id>/status', methods=['PUT'])
def update_ticket_status(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()
    new_status = data.get('status')
    if new_status not in ['waiting', 'serving', 'completed', 'missed']:
        return jsonify({"error": "Invalid status"}), 400
    ticket.status = new_status
    db.session.commit()
    return jsonify({"message": "Status updated", "status": ticket.status}), 200

@main.route('/api/staff/profile', methods=['GET'])
def get_staff_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user.user_id,
        "email": user.email,
        "role": user.role.role_name,
        "counter": user.counter,
        "full_name": user.full_name,
        "id_number": user.id_number
    }), 200

@main.route('/api/staff/profile', methods=['PUT'])
def update_staff_profile():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'counter' in data:
        user.counter = data['counter']
    if 'current_password' in data and 'new_password' in data:
        if not user.check_password(data['current_password']):
            return jsonify({"error": "Current password is incorrect"}), 401
        if len(data['new_password']) < 6:
            return jsonify({"error": "New password must be at least 6 characters"}), 400
        user.set_password(data['new_password'])
        # Optional: log password change (could add a simple notification table)
    db.session.commit()
    return jsonify({"message": "Profile updated"}), 200

@main.route('/api/staff/reports', methods=['GET'])
def get_staff_reports():
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    total_served = Ticket.query.filter(Ticket.status == 'completed', Ticket.created_at >= start_date).count()
    # Average wait time for completed tickets (if we had called_at)
    # For now, placeholder
    avg_wait = 0
    # Tickets per day
    daily = []
    for i in range(7):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = Ticket.query.filter(Ticket.created_at >= day_start, Ticket.created_at < day_end).count()
        daily.append({'date': day.strftime('%Y-%m-%d'), 'count': count})
    return jsonify({
        'total_served': total_served,
        'avg_wait_minutes': avg_wait,
        'daily_counts': daily[::-1]
    }), 200


@main.route('/api/kiosk/status', methods=['GET'])
def kiosk_status():
    """Get currently serving ticket and estimated wait time for the kiosk display."""
    # Get the first ticket with status 'serving' (if any)
    serving_ticket = Ticket.query.filter_by(status='serving').first()
    currently_serving = serving_ticket.ticket_number if serving_ticket else '---'

    # Estimate wait time based on number of waiting tickets
    waiting_count = Ticket.query.filter_by(status='waiting').count()
    estimated_wait = str(waiting_count * 5)  # 5 minutes per person

    return jsonify({
        "currently_serving": currently_serving,
        "estimated_wait": estimated_wait
    }), 200

@main.route('/api/settings', methods=['GET'])
def get_settings():
    """Return all system settings as a key-value object."""
    settings = SystemSetting.query.all()
    return jsonify({s.setting_key: s.setting_value for s in settings}), 200

@main.route('/api/settings/update', methods=['POST'])
def update_setting():
    """Update a single setting. Expects JSON like {"key": "value"}."""
    data = request.get_json()
    if not data or len(data) != 1:
        return jsonify({"error": "Invalid request"}), 400

    key = list(data.keys())[0]
    value = data[key]

    setting = SystemSetting.query.filter_by(setting_key=key).first()
    if setting:
        setting.setting_value = value
    else:
        setting = SystemSetting(setting_key=key, setting_value=value)
        db.session.add(setting)

    db.session.commit()
    return jsonify({"message": "Updated"}), 200