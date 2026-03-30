from app import create_app, db
from app.models import Role, User, SystemSetting, Service
from app.models import Ticket, SystemSetting, get_kenya_time

app = create_app()

with app.app_context():
    for ticket in Ticket.query.all():
        # Convert UTC to Kenya time (add 3 hours)
        ticket.created_at = ticket.created_at + timedelta(hours=3)
    for setting in SystemSetting.query.all():
        if setting.updated_at:
            setting.updated_at = setting.updated_at + timedelta(hours=3)
    db.session.commit()
    # Create all tables (if they don't exist)
    db.create_all()
    print("✅ Tables created.")

    # --- Create Roles ---
    roles = ["Admin", "Staff"]
    for r_name in roles:
        if not Role.query.filter_by(role_name=r_name).first():
            db.session.add(Role(role_name=r_name))
    db.session.commit()
    print("✅ Roles seeded.")

    admin_role = Role.query.filter_by(role_name="Admin").first()
    staff_role = Role.query.filter_by(role_name="Staff").first()

    # --- Create Admin User ---
    if not User.query.filter_by(email="prowler@officeq.com").first():
        admin = User(email="prowler@officeq.com", role=admin_role, full_name="Prowler Admin", id_number="ADM001")
        admin.set_password("Admin123!")
        db.session.add(admin)

    # --- Create Staff User ---
    if not User.query.filter_by(email="staff@officeq.com").first():
        staff = User(email="staff@officeq.com", role=staff_role, full_name="Staff User", id_number="STF001")
        staff.set_password("Staff123!")
        db.session.add(staff)

    # --- Initialize System Settings ---
    defaults = {
        'max_wait_time': '15',
        'avg_service_duration': '5-10',
        'office_name': 'OfficeQ Main Branch'
    }
    for key, val in defaults.items():
        if not SystemSetting.query.filter_by(setting_key=key).first():
            db.session.add(SystemSetting(setting_key=key, setting_value=val))

    # --- Seed Services ---
    default_services = [
        {"name": "General Inquiry", "duration": 5},
        {"name": "Technical Support", "duration": 15},
        {"name": "Payments", "duration": 10},
        {"name": "Account Opening", "duration": 20},
        {"name": "Document Submission", "duration": 10},
    ]
    for s in default_services:
        if not Service.query.filter_by(name=s["name"]).first():
            db.session.add(Service(name=s["name"], duration_minutes=s["duration"], active=True))
    db.session.commit()
    print("✅ Services seeded.")

    print("Seeding complete! Admin: prowler@officeq.com | Staff: staff@officeq.com")