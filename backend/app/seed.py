import random
from datetime import timedelta
from . import db
from .models import Role, User, SystemSetting, Service, Ticket, get_kenya_time


DEFAULT_SERVICES = [
    {"name": "General Inquiry", "duration": 5},
    {"name": "Payments", "duration": 8},
    {"name": "Account Opening", "duration": 15},
    {"name": "Technical Support", "duration": 12},
    {"name": "Document Submission", "duration": 7},
]

DEFAULT_SETTINGS = {
    'max_wait_time': '15',
    'avg_service_duration': '8',
    'office_name': 'QueueFlow Nairobi HQ',
    'priority_escalation': 'true',
}


def seed_demo_data(reset_tickets=False):
    """Ensure roles, demo accounts, services, settings, and sample queue traffic exist."""
    db.create_all()

    # 1. Roles
    for r_name in ["Admin", "Staff"]:
        if not Role.query.filter_by(role_name=r_name).first():
            db.session.add(Role(role_name=r_name))
    db.session.commit()

    admin_role = Role.query.filter_by(role_name="Admin").first()
    staff_role = Role.query.filter_by(role_name="Staff").first()

    # 2. Demo Accounts (clean portfolio credentials)
    demo_users = [
        ("admin@queueflow.io", "Admin123!", admin_role, "Alex Mwangi", "ADM-001", "HQ Control"),
        ("staff@queueflow.io", "Staff123!", staff_role, "Grace Wanjiku", "STF-101", "Counter 1"),
        ("david@queueflow.io", "Staff123!", staff_role, "David Ochieng", "STF-102", "Counter 2"),
        ("amina@queueflow.io", "Staff123!", staff_role, "Amina Hassan", "STF-103", "Counter 3"),
    ]
    for email, pwd, role, name, id_num, counter in demo_users:
        if not User.query.filter_by(email=email).first():
            u = User(
                email=email,
                role=role,
                full_name=name,
                id_number=id_num,
                counter=counter,
            )
            u.set_password(pwd)
            db.session.add(u)

    # 3. System Settings
    for key, val in DEFAULT_SETTINGS.items():
        existing = SystemSetting.query.filter_by(setting_key=key).first()
        if not existing:
            db.session.add(SystemSetting(setting_key=key, setting_value=val))
        elif reset_tickets:
            existing.setting_value = val

    # 4. Services
    for s in DEFAULT_SERVICES:
        if not Service.query.filter_by(name=s["name"]).first():
            db.session.add(Service(name=s["name"], duration_minutes=s["duration"], active=True))

    db.session.commit()

    # 5. Realistic Historical + Live Queue Tickets
    if reset_tickets:
        Ticket.query.delete()
        db.session.commit()

    if Ticket.query.count() == 0:
        now = get_kenya_time()
        service_names = [s["name"] for s in DEFAULT_SERVICES]
        counters = ["Counter 1", "Counter 2", "Counter 3"]

        # Seed past 6 days of completed tickets so Recharts analytics look rich immediately
        ticket_seq = 100
        for days_ago in range(6, 0, -1):
            day_base = now - timedelta(days=days_ago)
            daily_volume = random.randint(14, 28)
            for _ in range(daily_volume):
                ticket_seq += 1
                is_prio = 1 if random.random() < 0.22 else 0
                svc = random.choice(service_names)
                created = day_base.replace(
                    hour=random.randint(8, 16),
                    minute=random.randint(0, 55),
                    second=0,
                )
                wait_mins = random.randint(2, 6) if is_prio else random.randint(4, 14)
                handle_mins = random.randint(4, 14)
                called = created + timedelta(minutes=wait_mins)
                completed = called + timedelta(minutes=handle_mins)
                status = 'missed' if random.random() < 0.06 else 'completed'

                db.session.add(Ticket(
                    ticket_number=f"{'P' if is_prio else 'B'}{ticket_seq}",
                    service_type=svc,
                    status=status,
                    priority_level=is_prio,
                    counter=random.choice(counters),
                    created_at=created,
                    called_at=called,
                    completed_at=completed if status == 'completed' else None,
                ))

        # Seed today's live active queue (2 serving + 6 waiting + 5 already completed today)
        for i in range(5):
            created = now - timedelta(minutes=75 - i * 10)
            called = created + timedelta(minutes=random.randint(3, 8))
            completed = called + timedelta(minutes=random.randint(5, 9))
            db.session.add(Ticket(
                ticket_number=f"B{201 + i}",
                service_type=service_names[i % len(service_names)],
                status='completed',
                priority_level=0,
                counter=counters[i % len(counters)],
                created_at=created,
                called_at=called,
                completed_at=completed,
            ))

        # 2 currently serving tickets (great for TV display & Kiosk status)
        live_serving = [
            ("P301", "Payments", 1, "Counter 1", 12, 4),
            ("B302", "Account Opening", 0, "Counter 2", 16, 6),
        ]
        for t_num, svc, prio, ctr, created_ago, called_ago in live_serving:
            db.session.add(Ticket(
                ticket_number=t_num,
                service_type=svc,
                status='serving',
                priority_level=prio,
                counter=ctr,
                created_at=now - timedelta(minutes=created_ago),
                called_at=now - timedelta(minutes=called_ago),
            ))

        # 6 waiting tickets ready for recruiters to test Call Next
        live_waiting = [
            ("P303", "General Inquiry", 1, 9),
            ("B304", "Payments", 0, 8),
            ("B305", "Technical Support", 0, 7),
            ("P306", "Document Submission", 1, 5),
            ("B307", "General Inquiry", 0, 4),
            ("B308", "Payments", 0, 2),
        ]
        for t_num, svc, prio, mins_ago in live_waiting:
            db.session.add(Ticket(
                ticket_number=t_num,
                service_type=svc,
                status='waiting',
                priority_level=prio,
                created_at=now - timedelta(minutes=mins_ago),
            ))

        db.session.commit()