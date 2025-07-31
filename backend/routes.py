from datetime import datetime
from flask import send_from_directory
from flask import current_app as app, jsonify, render_template, request, send_file, send_from_directory
from flask_security import auth_required, verify_password, hash_password
from backend.celery.tasks import add, create_csv, export_users_csv
from celery.result import AsyncResult
from flask_security import roles_required

datastore = app.security.datastore
cache = app.cache

# @app.get('/')
# def home():
#     return render_template('index.html')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

@app.get('/celery')
def celery():
    task = add.delay(10, 20)
    return {'task_id': task.id}

@app.get('/get-celery-data/<task_id>')
def get_celery_data(task_id):
    result = AsyncResult(task_id)
    if result.ready():
        return {'result': result.result}, 200
    else:
        return {'message': 'task is not ready yet'}, 405

@app.get('/create-csv')
def createCSV():
    task = create_csv.delay()
    return {'task_id': task.id}, 200

@app.get('/get-csv/<csv_task_id>')
def getCSV(csv_task_id):
    result = AsyncResult(csv_task_id)
    if result.ready():
        return send_file(f'./backend/celery/user-downloads/{result.result}'), 200
    else:
        return {'message': 'task is not ready yet'}, 405

@app.route('/api/admin/export_users', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def trigger_export_users():
    task = export_users_csv.delay()
    return jsonify({'message': 'User export task started', 'task_id': task.id}), 202

@app.route('/api/admin/download_users/<filename>', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def download_user_csv(filename):
    path = './backend/celery/user-downloads'
    return send_from_directory(path, filename, as_attachment=True)

@app.get('/cache')
@cache.cached(timeout = 5)
def cache_test():
    return{"current time": str(datetime.now())}

@app.get('/protected')
@auth_required()
def protected():
    return "This is a protected route. You are able to see bcoz You are authenticated!"

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not (username or email) or not password:
        return jsonify({"error": "Missing required fields (username/email and password)"}), 400
    
    user = None
    if email: 
        user = datastore.find_user(email=email)
    if not user and username: 
        user = datastore.find_user(username=username)

    if not user:
        return jsonify({"error": "User not found"}), 404
    if not verify_password(password, user.password): 
        return jsonify({"error": "Invalid password"}), 401
    else:
        return jsonify({'token': user.get_auth_token(),
                        "user": {
                            "username": user.username,
                            "email": user.email,
                            "mobile_num": user.mobile_num,
                            "roles": [role.name for role in user.roles],
                            "user_id": user.user_id,
                            "age": user.age
                            }
                        }), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    mobile_num = data.get('mobile_num') 
    age = data.get('age')             

    # Basic validation for required fields
    if not (username and email and password and mobile_num and age is not None):
        return jsonify({"error": "Missing required fields (username, email, password, mobile_num, age)"}), 400

    if datastore.find_user(email=email) or datastore.find_user(username=username):
        return jsonify({"error": "User with this email or username already exists"}), 409
    
    if(age < 18):
        return jsonify({"error": "User must be at least 18 years old"}), 400

    try:
        user = datastore.create_user(
            username=username,
            email=email,
            password=hash_password(password),
            mobile_num=mobile_num,
            age=age
        )
        datastore.commit()
        
        default_user_role = datastore.find_role('user') 
        if not default_user_role: 
            default_user_role = datastore.find_or_create_role(name='user', description='Regular user with limited permissions')
            datastore.commit() 

        datastore.add_role_to_user(user, default_user_role) # Assign the 'user' role
        datastore.commit()
        
        return jsonify({'message': 'User registered successfully', 'user_id': user.user_id}), 201

    except Exception as e:
        datastore.session.rollback()
        app.logger.error(f"Error during user registration: {e}", exc_info=True)
        return jsonify({"error": f"Failed to register user: {str(e)}"}), 500