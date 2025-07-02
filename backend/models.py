from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    mobile_num = db.Column(db.String(10), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    #flask-security specific fields
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
    active = db.Column(db.Boolean, default = True)

    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('users', lazy='dynamic'))

class Role(db.Model, RoleMixin):
    role_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=True)

class UserRoles(db.Model):
    userrole_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey('role.role_id'), primary_key=True)
    # user = db.relationship(User, backref='roles')
    # role = db.relationship(Role, backref='users')

class ParkingLot(db.Model):
    plot_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    location = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    pincode = db.Column(db.String(6), nullable=False)
    total_slots = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    spots = db.relationship('ParkingSpot', backref='parking_lot', lazy=True)

class ParkingSpot(db.Model):
    pspot_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    plot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.plot_id'), nullable=False)
    status = db.Column(db.Boolean, default=False)

    bookings = db.relationship('Booking', backref='parking_spot', lazy=True)

class Booking(db.Model):
    booking_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pspot_id = db.Column(db.Integer, db.ForeignKey('parking_spot.pspot_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)

    user = db.relationship('User', backref='bookings', lazy=True)