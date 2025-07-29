from flask import current_app as app
from backend.models import db, ParkingLot, ParkingSpot # FIX: Import ParkingLot and ParkingSpot
from flask_security import SQLAlchemyUserDatastore, hash_password

def initialize_database():
    with app.app_context(): # This context will now be pushed by app.py before calling this function
        db.create_all()
        userdatastore : SQLAlchemyUserDatastore = app.security.datastore

        userdatastore.find_or_create_role(name='admin', description='Superuser with all permissions')
        userdatastore.find_or_create_role(name='user', description='Regular user with limited permissions')

        if(not userdatastore.find_user(email = 'admin@gmail.com')):
            userdatastore.create_user( 
                email = 'admin@gmail.com', 
                username = 'admin', 
                password = hash_password('admin123'), 
                mobile_num = '1234567890', 
                age = 30)
        
        if(not userdatastore.find_user(email = 'testuser@gmail.com')):
            userdatastore.create_user( 
                email = 'testuser@gmail.com', 
                username = 'test_user', 
                password = hash_password('testuser123'), 
                mobile_num = '0987654321', 
                age = 25)    
        
        db.session.commit()

        admin_user = userdatastore.find_user(email='admin@gmail.com')
        test_user = userdatastore.find_user(email='testuser@gmail.com')

        if admin_user and not admin_user.has_role('admin'):
            userdatastore.add_role_to_user(admin_user, 'admin')

        if test_user and not test_user.has_role('user'):
            userdatastore.add_role_to_user(test_user, 'user')

        db.session.commit()

        if not ParkingLot.query.filter_by(location='Downtown Plaza').first():
            lot1 = ParkingLot(
                location='Downtown Plaza',
                address='123 Main St, City Center',
                pincode='110001',
                total_slots=3,
                price=15.00
            )
            db.session.add(lot1)
            db.session.commit() 

            for _ in range(lot1.total_slots):
                db.session.add(ParkingSpot(plot_id=lot1.plot_id, status=False))
            db.session.commit()
            print(f"Created Parking Lot: {lot1.location} with {lot1.total_slots} spots.")

        if not ParkingLot.query.filter_by(location='Tech Park Garage').first():
            lot2 = ParkingLot(
                location='Tech Park Garage',
                address='45 Innovation Ave, Tech City',
                pincode='560066',
                total_slots=2,
                price=20.50
            )
            db.session.add(lot2)
            db.session.commit()

            for _ in range(lot2.total_slots):
                db.session.add(ParkingSpot(plot_id=lot2.plot_id, status=False))
            db.session.commit()
            print(f"Created Parking Lot: {lot2.location} with {lot2.total_slots} spots.")

        if not ParkingLot.query.filter_by(location='Riverside Parking').first():
            lot3 = ParkingLot(
                location='Riverside Parking',
                address='789 Riverfront Rd, Old Town',
                pincode='400001',
                total_slots=1, 
                price=10.00
            )
            db.session.add(lot3)
            db.session.commit()

            for _ in range(lot3.total_slots):
                db.session.add(ParkingSpot(plot_id=lot3.plot_id, status=False))
            db.session.commit()
            print(f"Created Parking Lot: {lot3.location} with {lot3.total_slots} spots.")

        print("Initial data creation complete.")