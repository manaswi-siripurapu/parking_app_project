from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore, hash_password

with app.app_context():
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