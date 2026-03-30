from app import create_app, db
from app.models import Role, User, SystemSetting

app = create_app()

with app.app_context():
    # Create all tables (this will create 'tickets' with priority_level)
    db.create_all()
    print("✅ Tables created.")
    
    # 1. Create Roles
    roles = ["Admin", "Staff"]
    for r_name in roles:
        if not Role.query.filter_by(role_name=r_name).first():
            db.session.add(Role(role_name=r_name))
    db.session.commit()

    admin_role = Role.query.filter_by(role_name="Admin").first()
    staff_role = Role.query.filter_by(role_name="Staff").first()

    # 2. Create Admin User
    if not User.query.filter_by(email="prowler@officeq.com").first():
        admin = User(email="prowler@officeq.com", role=admin_role)
        admin.set_password("Admin123!")
        db.session.add(admin)

    # 3. Create Staff User
    if not User.query.filter_by(email="staff@officeq.com").first():
        staff = User(email="staff@officeq.com", role=staff_role)
        staff.set_password("Staff123!")
        db.session.add(staff)

    # 4. Initialize System Settings
    defaults = {
        'max_wait_time': '15',
        'avg_service_duration': '5-10',
        'office_name': 'OfficeQ Main Branch'
    }
    for key, val in defaults.items():
        if not SystemSetting.query.filter_by(setting_key=key).first():
            db.session.add(SystemSetting(setting_key=key, setting_value=val))

    db.session.commit()
    print("Seeding complete! Admin: prowler@officeq.com | Staff: staff@officeq.com")