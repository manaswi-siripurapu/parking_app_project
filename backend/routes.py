from flask import current_app as app, jsonify, render_template, request
from flask_security import auth_required, verify_password

datastore = app.security.datastore


# @app.get('/')
# def home():
#     return render_template('index.html')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

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

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
    
    user = datastore.find_user(username=username, email=email)

    if not user:
        return jsonify({"error": "User not found"}), 404
    if not verify_password(password, user.password): 
        #or user.verify_password(password): is also valid
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
    mobile_num = data.get('mobile_num', '0000000000')  # Default if not provided
    age = data.get('age', 18)  # Default if not provided
    role = data.get('role', 'user')  # Default to 'user' if not provided

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if datastore.find_user(email=email) or datastore.find_user(username=username):
        return jsonify({"error": "User with this email or username already exists"}), 409

    try:
        user = datastore.create_user(
            username=username,
            email=email,
            password=password,
            mobile_num=mobile_num,
            age=age
        )
        datastore.commit()
        # Only allow 'admin' role if you trust the source!
        datastore.add_role_to_user(user, role)
        datastore.commit()
        return jsonify({'message': 'User registered successfully', 'user_id': user.user_id}), 201

    except Exception as e:
        datastore.rollback()
        return jsonify({"error": f"Failed to register user: {str(e)}"}), 500