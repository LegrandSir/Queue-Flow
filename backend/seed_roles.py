from app import create_app, db
from app.models import Role, User

app = create_app()

with app.app_context():
    # 1. Create Roles if they don't exist
    admin_role = Role.query.filter_by(role_name="Admin").first()
    if not admin_role:
        admin_role = Role(role_name="Admin")
        db.session.add(admin_role)
    
    staff_role = Role.query.filter_by(role_name="Staff").first()
    if not staff_role:
        staff_role = Role(role_name="Staff")
        db.session.add(staff_role)
    
    db.session.commit()

    # 2. Create Admin User if doesn't exist
    admin_user = User.query.filter_by(email="prowler@officeq.com").first()
    if not admin_user:
        admin_user = User(
            email="prowler@officeq.com",
            role=admin_role
        )
        admin_user.set_password("Admin123!") 
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user 'prowler@officeq.com' created!")
    else:
        print("Admin user already exists.")

    print("Seeding complete!")