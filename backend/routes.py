from flask import current_app as app, jsonify, render_template, request
from flask_security import auth_required, verify_password

datastore = app.security.datastore


@app.get('/')
def home():
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
                            # "role": user.roles[0],
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
    # mobile_num = data.get('mobile_num')
    # age = data.get('age')

    if not username or not email or not password :
        return jsonify({"error": "Missing required fields"}), 400

    if datastore.find_user(email=email):
        return jsonify({"error": "User with this email already exists"}), 409

    try:
        user = datastore.create_user(username=username, email=email, password=password, mobile_num='6363645454', age=19)
        datastore.commit()
        return jsonify({'message': 'User registered successfully', 'user_id': user.user_id}), 201
    
    except:
        datastore.rollback()
        return jsonify({"error": "Failed to register user"}), 500