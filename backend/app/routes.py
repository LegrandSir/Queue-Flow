from flask import Blueprint, request, jsonify, make_response
from .models import Ticket, User, SystemSetting
from . import db
import random
import csv
import io
import requests
from datetime import datetime, timedelta

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
    # Fetch waiting tickets ordered by priority first, then time
    active_tickets = Ticket.query.filter_by(status='waiting')\
        .order_by(Ticket.priority_level.desc(), Ticket.created_at.asc()).all()
    
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