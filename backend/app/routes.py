from flask import Blueprint, request, jsonify, make_response
from .models import Ticket, User, SystemSetting, Service, Role, get_kenya_time
from .seed import seed_demo_data
from . import db
import random
import csv
import io
from datetime import timedelta
from sqlalchemy import func

main = Blueprint('main', __name__)


def _avg_wait_minutes(tickets):
    """Calculate real average wait time in minutes from created_at -> called_at."""
    waits = [
        max(0, (t.called_at - t.created_at).total_seconds() / 60.0)
        for t in tickets
        if t.called_at and t.created_at
    ]
    return round(sum(waits) / len(waits), 1) if waits else 0.0


def _generate_unique_ticket_number(is_priority):
    prefix = "P" if is_priority else "B"
    active_nums = {
        t.ticket_number
        for t in Ticket.query.filter(Ticket.status.in_(['waiting', 'serving'])).all()
    }
    for _ in range(50):
        candidate = f"{prefix}{random.randint(100, 999)}"
        if candidate not in active_nums:
            return candidate
    return f"{prefix}{random.randint(1000, 9999)}"


# --- HEALTH & DEMO CONTROLS ---

@main.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "QueueFlow API"}), 200


@main.route('/api/demo/reset', methods=['POST'])
def demo_reset():
    """Reset the live demo back to a clean, populated baseline."""
    try:
        seed_demo_data(reset_tickets=True)
        return jsonify({"message": "Demo environment reset with fresh sample traffic."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@main.route('/api/demo/simulate', methods=['POST'])
def demo_simulate():
    """Generate 1-3 realistic walk-in tickets so recruiters can see live queue movement."""
    try:
        active_services = Service.query.filter_by(active=True).all()
        if not active_services:
            return jsonify({"error": "No active services available"}), 400

        count = request.get_json(silent=True) or {}
        num_to_add = min(max(int(count.get('count', 2)), 1), 5)
        created = []

        for _ in range(num_to_add):
            svc = random.choice(active_services)
            is_prio = random.random() < 0.3
            t_num = _generate_unique_ticket_number(is_prio)
            ticket = Ticket(
                ticket_number=t_num,
                service_type=svc.name,
                status='waiting',
                priority_level=1 if is_prio else 0,
                created_at=get_kenya_time(),
            )
            db.session.add(ticket)
            created.append(t_num)

        db.session.commit()
        return jsonify({"message": f"Added {len(created)} simulated tickets", "tickets": created}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --- OPERATIONS INSIGHTS (LOGIC ENGINE) ---

@main.route('/api/admin/ai-insights', methods=['GET'])
def get_ai_insights():
    """Generates a live data-driven operations summary without external API fragility."""
    try:
        active_tickets = Ticket.query.filter(Ticket.status.in_(['waiting', 'serving'])).all()
        waiting_tickets = [t for t in active_tickets if t.status == 'waiting']
        serving_tickets = [t for t in active_tickets if t.status == 'serving']
        priority_waiting = sum(1 for t in waiting_tickets if t.priority_level > 0)

        if not active_tickets:
            return jsonify({
                "status": "clear",
                "summary": "All service queues are currently clear. Counters are idle and ready for walk-ins.",
                "busiest_service": None,
                "estimated_wait": 0,
                "recommendation": "Great window for counter handovers or administrative wrap-up.",
                "insight": "Queue is currently empty. All departments are clear.",
            }), 200

        service_stats = {}
        for t in active_tickets:
            service_stats[t.service_type] = service_stats.get(t.service_type, 0) + 1

        busiest_service = max(service_stats, key=service_stats.get)
        busiest_volume = service_stats[busiest_service]
        est_wait = len(waiting_tickets) * 5

        if len(waiting_tickets) >= 6:
            status_level = "high"
            recommendation = f"High load detected. Open an overflow desk for '{busiest_service}' immediately."
        elif busiest_volume > len(active_tickets) * 0.55:
            status_level = "moderate"
            recommendation = f"Traffic is heavily concentrated in '{busiest_service}' ({busiest_volume} active). Consider cross-assigning a counter."
        elif priority_waiting >= 2:
            status_level = "moderate"
            recommendation = f"{priority_waiting} priority guests waiting. Keep Counter 1 dedicated to priority fast-track."
        else:
            status_level = "optimal"
            recommendation = "Queue velocity is balanced across departments. Maintain current counter staffing."

        report = (
            f"Traffic: {len(active_tickets)} active tickets ({len(serving_tickets)} serving, {len(waiting_tickets)} waiting). "
            f"Busiest desk: {busiest_service} ({busiest_volume} tickets). "
            f"Recommendation: {recommendation}"
        )

        return jsonify({
            "status": status_level,
            "active_count": len(active_tickets),
            "waiting_count": len(waiting_tickets),
            "serving_count": len(serving_tickets),
            "priority_waiting": priority_waiting,
            "busiest_service": busiest_service,
            "busiest_volume": busiest_volume,
            "estimated_wait": est_wait,
            "recommendation": recommendation,
            "insight": report,
        }), 200
    except Exception as e:
        print(f"Insight Error: {str(e)}")
        return jsonify({"insight": "Analytics engine recalibrating. Refresh shortly."}), 200


# --- CUSTOMER ASSISTANT CHAT ---

@main.route('/api/user/ai-chat', methods=['POST'])
def user_ai_chat():
    try:
        data = request.get_json() or {}
        t_num = data.get('ticket_number')
        msg = (data.get('message') or '').lower()

        ticket = Ticket.query.filter_by(ticket_number=t_num).order_by(Ticket.ticket_id.desc()).first()
        if not ticket:
            return jsonify({"reply": "I couldn't locate that ticket number. Please check the kiosk screen or grab a fresh ticket."}), 200

        if ticket.status == 'serving':
            ctr = ticket.counter or "the service counter"
            return jsonify({"reply": f"Good news — ticket {t_num} is being served right now! Please head directly to {ctr}."}), 200
        if ticket.status == 'completed':
            return jsonify({"reply": f"Ticket {t_num} has already been completed. Thanks for visiting QueueFlow!"}), 200

        service = ticket.service_type
        svc_obj = Service.query.filter_by(name=service).first()
        avg_dur = svc_obj.duration_minutes if svc_obj else 5

        people_ahead = Ticket.query.filter(
            Ticket.status == 'waiting',
            Ticket.service_type == service,
            (
                (Ticket.priority_level > ticket.priority_level) |
                ((Ticket.priority_level == ticket.priority_level) & (Ticket.created_at < ticket.created_at))
            )
        ).count()

        wait_min = max(2, (people_ahead + 1) * max(3, avg_dur // 2))

        if any(w in msg for w in ["long", "wait", "time", "minutes", "how much"]):
            reply = f"You have {people_ahead} {'person' if people_ahead == 1 else 'people'} ahead in {service}. Estimated wait is roughly {wait_min} minutes."
        elif any(w in msg for w in ["next", "turn", "position", "spot", "queue"]):
            reply = (
                f"You're up next for {service}! Stay close to the waiting area."
                if people_ahead == 0
                else f"You're currently #{people_ahead + 1} in line for {service}."
            )
        elif any(w in msg for w in ["priority", "vip", "fast"]):
            reply = (
                "Your ticket has Priority status and automatically moves ahead of standard tickets."
                if ticket.priority_level > 0
                else "Your ticket is in the Standard queue. Priority guests (PWD, elderly, expectant mothers) are automatically fast-tracked."
            )
        elif any(w in msg for w in ["hi", "hello", "hey", "help"]):
            reply = f"Hey there! I'm tracking ticket {t_num} for {service}. Ask me about your wait time, queue position, or counter status anytime."
        else:
            reply = f"Ticket {t_num} ({service}) is active with {people_ahead} ahead (~{wait_min} min wait). I'll keep your screen updated automatically!"

        return jsonify({"reply": reply}), 200
    except Exception:
        return jsonify({"reply": "Refreshing live queue data—please check the status card above!"}), 200


# --- TICKET GENERATION, MOBILE TRACKER & PUBLIC TV DISPLAY ---

@main.route('/api/tickets/generate', methods=['POST'])
def generate_ticket():
    data = request.get_json() or {}
    service_name = data.get('service_type')
    is_priority = bool(data.get('priority', False))

    if not service_name:
        return jsonify({"error": "Service type is required"}), 400

    ticket_num = _generate_unique_ticket_number(is_priority)
    now = get_kenya_time()

    try:
        priority_val = 1 if is_priority else 0
        count_ahead = Ticket.query.filter(
            Ticket.status == 'waiting',
            Ticket.service_type == service_name,
            (
                (Ticket.priority_level > priority_val) |
                ((Ticket.priority_level == priority_val) & (Ticket.created_at < now))
            )
        ).count()

        svc = Service.query.filter_by(name=service_name).first()
        per_person = max(3, (svc.duration_minutes // 2) if svc else 5)
        est_minutes = max(2, (count_ahead + 1) * per_person)

        new_ticket = Ticket(
            ticket_number=ticket_num,
            service_type=service_name,
            status='waiting',
            priority_level=priority_val,
            created_at=now,
        )
        db.session.add(new_ticket)
        db.session.commit()

        return jsonify({
            "id": new_ticket.ticket_id,
            "ticket_number": ticket_num,
            "service_type": service_name,
            "priority_level": priority_val,
            "wait_time": f"{est_minutes} min",
            "estimated_minutes": est_minutes,
            "people_ahead": count_ahead,
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@main.route('/api/tickets/status/<ticket_num>', methods=['GET'])
def get_ticket_status(ticket_num):
    user_ticket = Ticket.query.filter_by(ticket_number=ticket_num).order_by(Ticket.ticket_id.desc()).first()
    if not user_ticket:
        return jsonify({"error": "Ticket not found"}), 404

    people_ahead = Ticket.query.filter(
        Ticket.status == 'waiting',
        Ticket.service_type == user_ticket.service_type,
        (
            (Ticket.priority_level > user_ticket.priority_level) |
            ((Ticket.priority_level == user_ticket.priority_level) & (Ticket.created_at < user_ticket.created_at))
        )
    ).count()

    serving_now = Ticket.query.filter_by(status='serving', service_type=user_ticket.service_type)\
        .order_by(Ticket.called_at.desc()).first()
    svc = Service.query.filter_by(name=user_ticket.service_type).first()
    per_person = max(3, (svc.duration_minutes // 2) if svc else 5)

    return jsonify({
        "ticket_number": user_ticket.ticket_number,
        "status": user_ticket.status,
        "service": user_ticket.service_type,
        "priority_level": user_ticket.priority_level,
        "counter": user_ticket.counter or "Counter 1",
        "people_ahead": 0 if user_ticket.status != 'waiting' else people_ahead,
        "estimated_minutes": 0 if user_ticket.status != 'waiting' else max(2, (people_ahead + 1) * per_person),
        "currently_serving": serving_now.ticket_number if serving_now else "---",
        "created_at": user_ticket.created_at.isoformat() if user_ticket.created_at else None,
    }), 200


@main.route('/api/display/board', methods=['GET'])
def display_board():
    """Live Public Waiting Room TV Board data."""
    serving = Ticket.query.filter_by(status='serving')\
        .order_by(Ticket.called_at.desc(), Ticket.updated_at.desc()).all()
    waiting = Ticket.query.filter_by(status='waiting')\
        .order_by(Ticket.priority_level.desc(), Ticket.created_at.asc()).limit(10).all()
    office_setting = SystemSetting.query.filter_by(setting_key='office_name').first()

    return jsonify({
        "office_name": office_setting.setting_value if office_setting else "QueueFlow Main Branch",
        "serving": [t.to_dict() for t in serving],
        "up_next": [t.to_dict() for t in waiting],
        "total_waiting": Ticket.query.filter_by(status='waiting').count(),
        "timestamp": get_kenya_time().isoformat(),
    }), 200


@main.route('/api/kiosk/status', methods=['GET'])
def kiosk_status():
    serving_ticket = Ticket.query.filter_by(status='serving')\
        .order_by(Ticket.called_at.desc(), Ticket.updated_at.desc()).first()
    currently_serving = serving_ticket.ticket_number if serving_ticket else '---'
    waiting_count = Ticket.query.filter_by(status='waiting').count()
    office_setting = SystemSetting.query.filter_by(setting_key='office_name').first()
    prio_setting = SystemSetting.query.filter_by(setting_key='priority_escalation').first()

    return jsonify({
        "currently_serving": currently_serving,
        "serving_counter": serving_ticket.counter if serving_ticket else None,
        "serving_service": serving_ticket.service_type if serving_ticket else None,
        "waiting_count": waiting_count,
        "estimated_wait": str(max(2, waiting_count * 4)) if waiting_count > 0 else "0",
        "office_name": office_setting.setting_value if office_setting else "QueueFlow Main Branch",
        "priority_enabled": (prio_setting.setting_value.lower() == 'true') if prio_setting else True,
    }), 200


# --- STAFF & DASHBOARD OPERATIONS ---

@main.route('/api/tickets/active', methods=['GET'])
def get_active_tickets():
    active_tickets = Ticket.query.filter(Ticket.status.in_(['waiting', 'serving']))\
        .order_by(Ticket.priority_level.desc(), Ticket.created_at.asc()).all()
    return jsonify([t.to_dict() for t in active_tickets]), 200


@main.route('/api/tickets/call-next', methods=['POST'])
def call_next():
    data = request.get_json() or {}
    service_requested = data.get('service')
    counter = data.get('counter') or 'Counter 1'
    now = get_kenya_time()

    # Auto-complete any ticket currently being served at this same counter so serving never piles up
    prev_serving = Ticket.query.filter_by(status='serving', counter=counter).all()
    for p in prev_serving:
        p.status = 'completed'
        p.completed_at = now

    query = Ticket.query.filter_by(status='waiting')
    if service_requested and service_requested != 'All Services':
        query = query.filter_by(service_type=service_requested)

    ticket = query.order_by(Ticket.priority_level.desc(), Ticket.created_at.asc()).first()

    if ticket:
        ticket.status = 'serving'
        ticket.counter = counter
        ticket.called_at = now
        db.session.commit()
        return jsonify({
            "message": f"Now serving {ticket.ticket_number} at {counter}",
            "ticket": ticket.to_dict(),
            "ticket_number": ticket.ticket_number,
        }), 200

    db.session.commit()
    return jsonify({"message": f"No waiting tickets in {service_requested or 'the queue'}"}), 404


@main.route('/api/tickets/<int:ticket_id>/status', methods=['PUT'])
def update_ticket_status(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['waiting', 'serving', 'completed', 'missed']:
        return jsonify({"error": "Invalid status"}), 400

    now = get_kenya_time()
    ticket.status = new_status
    if new_status == 'serving':
        ticket.called_at = ticket.called_at or now
        if data.get('counter'):
            ticket.counter = data['counter']
    elif new_status == 'completed':
        ticket.completed_at = now
        ticket.called_at = ticket.called_at or now

    db.session.commit()
    return jsonify({"message": f"Ticket {ticket.ticket_number} marked as {new_status}", "ticket": ticket.to_dict()}), 200


# --- AUTH ---

@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get('email')).first()
    if user and user.check_password(data.get('password', '')):
        return jsonify({
            "message": "Login successful",
            "user": user.to_dict(),
        }), 200
    return jsonify({"message": "Invalid email or password"}), 401


# --- SYSTEM TOOLS ---

@main.route('/api/system/export-csv', methods=['GET'])
def export_tickets_csv():
    try:
        tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
        si = io.StringIO()
        cw = csv.writer(si)
        cw.writerow(['ID', 'Ticket Number', 'Service', 'Status', 'Priority', 'Counter', 'Created At', 'Called At', 'Completed At'])
        for t in tickets:
            cw.writerow([
                t.ticket_id, t.ticket_number, t.service_type, t.status,
                'HIGH' if t.priority_level > 0 else 'NORMAL',
                t.counter or '', t.created_at, t.called_at or '', t.completed_at or ''
            ])
        output = make_response(si.getvalue())
        output.headers["Content-Disposition"] = "attachment; filename=queueflow_report.csv"
        output.headers["Content-type"] = "text/csv"
        return output
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@main.route('/api/system/clear-cache', methods=['POST'])
def clear_cache():
    try:
        Ticket.query.filter(Ticket.status.in_(['waiting', 'serving'])).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({"message": "Active queue cleared"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@main.route('/api/system/reboot', methods=['POST'])
def reboot_system():
    try:
        seed_demo_data(reset_tickets=True)
        return jsonify({"message": "System reset to default SLA targets and demo dataset."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --- SERVICE MANAGEMENT ---

@main.route('/api/services', methods=['GET'])
def get_services():
    services = Service.query.order_by(Service.id.asc()).all()
    return jsonify([s.to_dict() for s in services]), 200


@main.route('/api/services', methods=['POST'])
def add_service():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({"error": "Service name required"}), 400
    if Service.query.filter_by(name=name).first():
        return jsonify({"error": "Service already exists"}), 409

    duration = int(data.get('duration', 10))
    service = Service(name=name, duration_minutes=duration, active=True)
    db.session.add(service)
    db.session.commit()
    return jsonify(service.to_dict()), 201


@main.route('/api/services/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    service = Service.query.get_or_404(service_id)
    data = request.get_json() or {}
    if 'name' in data:
        new_name = data['name'].strip()
        if new_name != service.name and Service.query.filter_by(name=new_name).first():
            return jsonify({"error": "Service name already exists"}), 409
        service.name = new_name
    if 'duration' in data:
        service.duration_minutes = int(data['duration'])
    if 'active' in data:
        service.active = bool(data['active'])
    db.session.commit()
    return jsonify(service.to_dict()), 200


@main.route('/api/services/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service deleted"}), 200


# --- STAFF MANAGEMENT ---

@main.route('/api/staff', methods=['GET'])
def get_staff():
    staff_role = Role.query.filter_by(role_name='Staff').first()
    if not staff_role:
        return jsonify([]), 200
    staff_users = User.query.filter_by(role_id=staff_role.role_id).order_by(User.user_id.asc()).all()
    return jsonify([u.to_dict() for u in staff_users]), 200


@main.route('/api/staff', methods=['POST'])
def add_staff():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip()
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    staff_role = Role.query.filter_by(role_name='Staff').first()
    if not staff_role:
        staff_role = Role(role_name='Staff')
        db.session.add(staff_role)
        db.session.commit()

    new_staff = User(
        email=email,
        role=staff_role,
        counter=data.get('counter'),
        full_name=data.get('full_name'),
        id_number=data.get('id_number'),
    )
    new_staff.set_password(password)
    db.session.add(new_staff)
    db.session.commit()
    return jsonify(new_staff.to_dict()), 201


@main.route('/api/staff/<int:staff_id>', methods=['PUT'])
def update_staff(staff_id):
    staff = User.query.get_or_404(staff_id)
    if staff.role.role_name != 'Staff':
        return jsonify({"error": "User is not staff"}), 400
    data = request.get_json() or {}
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
    if data.get('password'):
        staff.set_password(data['password'])
    db.session.commit()
    return jsonify(staff.to_dict()), 200


@main.route('/api/staff/<int:staff_id>', methods=['DELETE'])
def delete_staff(staff_id):
    staff = User.query.get_or_404(staff_id)
    if staff.role.role_name != 'Staff':
        return jsonify({"error": "User is not staff"}), 400
    db.session.delete(staff)
    db.session.commit()
    return jsonify({"message": "Staff deleted"}), 200


# --- SETTINGS ---

@main.route('/api/settings', methods=['GET'])
def get_settings():
    settings = SystemSetting.query.all()
    return jsonify({s.setting_key: s.setting_value for s in settings}), 200


@main.route('/api/settings/update', methods=['POST'])
def update_setting():
    data = request.get_json() or {}
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    for key, value in data.items():
        val_str = str(value).lower() if isinstance(value, bool) else str(value)
        setting = SystemSetting.query.filter_by(setting_key=key).first()
        if setting:
            setting.setting_value = val_str
        else:
            db.session.add(SystemSetting(setting_key=key, setting_value=val_str))

    db.session.commit()
    return jsonify({"message": "Settings updated"}), 200


# --- REPORTS & ANALYTICS ---

@main.route('/api/reports/stats', methods=['GET'])
def get_report_stats():
    try:
        days = request.args.get('days', 30, type=int)
        now = get_kenya_time()
        start_date = now - timedelta(days=days)

        period_tickets = Ticket.query.filter(Ticket.created_at >= start_date).all()
        total_tickets = len(period_tickets)
        completed_count = sum(1 for t in period_tickets if t.status == 'completed')
        missed_count = sum(1 for t in period_tickets if t.status == 'missed')
        avg_wait_minutes = _avg_wait_minutes(period_tickets)

        daily_counts = []
        for i in range(6, -1, -1):
            day = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            day_tickets = [t for t in period_tickets if t.created_at and day_start <= t.created_at < day_end]
            daily_counts.append({
                'date': day.strftime('%b %d'),
                'full_date': day.strftime('%Y-%m-%d'),
                'count': len(day_tickets),
                'completed': sum(1 for t in day_tickets if t.status == 'completed'),
            })

        service_map = {}
        for t in period_tickets:
            service_map[t.service_type] = service_map.get(t.service_type, 0) + 1
        service_stats = [{'service': k, 'count': v} for k, v in service_map.items()]

        priority_count = sum(1 for t in period_tickets if t.priority_level > 0)
        normal_count = total_tickets - priority_count

        return jsonify({
            'total_tickets': total_tickets,
            'completed_tickets': completed_count,
            'missed_tickets': missed_count,
            'completion_rate': round((completed_count / total_tickets) * 100, 1) if total_tickets else 0,
            'avg_wait_minutes': avg_wait_minutes,
            'daily_counts': daily_counts,
            'service_stats': service_stats,
            'priority_count': priority_count,
            'normal_count': normal_count,
            'period_days': days,
        }), 200
    except Exception as e:
        print(f"Report error: {e}")
        return jsonify({"error": str(e)}), 500


@main.route('/api/reports/efficiency', methods=['GET'])
def get_service_efficiency():
    services = Service.query.filter_by(active=True).all()
    efficiency = []
    for svc in services:
        completed = Ticket.query.filter_by(service_type=svc.name, status='completed').all()
        durations = [
            max(1, (t.completed_at - t.called_at).total_seconds() / 60.0)
            for t in completed
            if t.completed_at and t.called_at
        ]
        avg_time = round(sum(durations) / len(durations), 1) if durations else svc.duration_minutes
        efficiency.append({
            'service': svc.name,
            'avg_handling_minutes': avg_time,
            'target_minutes': svc.duration_minutes,
            'served_count': len(completed),
        })
    return jsonify(efficiency), 200


@main.route('/api/staff/profile', methods=['GET'])
def get_staff_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@main.route('/api/staff/profile', methods=['PUT'])
def update_staff_profile():
    data = request.get_json() or {}
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
    if data.get('current_password') and data.get('new_password'):
        if not user.check_password(data['current_password']):
            return jsonify({"error": "Current password is incorrect"}), 401
        if len(data['new_password']) < 6:
            return jsonify({"error": "New password must be at least 6 characters"}), 400
        user.set_password(data['new_password'])

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200


@main.route('/api/staff/reports', methods=['GET'])
def get_staff_reports():
    days = request.args.get('days', 30, type=int)
    now = get_kenya_time()
    start_date = now - timedelta(days=days)

    period_tickets = Ticket.query.filter(Ticket.created_at >= start_date).all()
    completed = [t for t in period_tickets if t.status == 'completed']
    avg_wait = _avg_wait_minutes(completed)

    daily = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_tickets = [t for t in period_tickets if t.created_at and day_start <= t.created_at < day_end]
        daily.append({
            'date': day.strftime('%b %d'),
            'count': len(day_tickets),
            'completed': sum(1 for t in day_tickets if t.status == 'completed'),
        })

    return jsonify({
        'total_served': len(completed),
        'total_tickets': len(period_tickets),
        'avg_wait_minutes': avg_wait,
        'daily_counts': daily,
    }), 200