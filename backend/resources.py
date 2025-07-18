from flask_restful import Resource, Api, fields, marshal_with
from backend.models import ParkingLot, ParkingSpot, Booking, User, Role, UserRoles, db
from flask_security import auth_required, current_user
from flask import jsonify, request

api = Api(prefix='/api')

ParkingLot_fields = {
    'plot_id': fields.Integer,
    'location': fields.String,
    'address': fields.String,
    'pincode': fields.String,
    'total_slots': fields.Integer,
    'price': fields.Float
}

class ParkingLotAPI(Resource):

    @auth_required('token')
    @marshal_with(ParkingLot_fields)
    def get(self, plot_id):
        try:
            plot_id = int(plot_id)
        except (ValueError, TypeError):
            return {'message': 'Invalid plot_id'}, 400
        parking_lot = ParkingLot.query.filter_by(plot_id=plot_id).first()
        if not parking_lot:
            return {'message': 'Parking lot not found'}, 404
        return parking_lot

    @auth_required('token')
    def delete(self, plot_id):
        try:
            plot_id = int(plot_id)
        except (ValueError, TypeError):
            return {'message': 'Invalid plot_id'}, 400
        parking_lot = ParkingLot.query.filter_by(plot_id=plot_id).first()
        if not parking_lot:
            return {'message': 'Parking lot not found'}, 404

        if not current_user.has_role('admin'):
            return {'message': 'Permission denied'}, 403

        # Find all spot IDs for this parking lot
        spot_ids = [spot.pspot_id for spot in ParkingSpot.query.filter_by(plot_id=plot_id).all()]
        if spot_ids:
            # Check if any booking exists for these spots
            if Booking.query.filter(Booking.pspot_id.in_(spot_ids)).count() > 0:
                return {'message': 'Cannot delete parking lot with existing bookings'}, 400

        try:
            db.session.delete(parking_lot)
            db.session.commit()
            return {'message': 'Parking lot deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error deleting parking lot: {str(e)}'}, 500

class ParkingLotListAPI(Resource):

    @auth_required('token')
    @marshal_with(ParkingLot_fields)
    def get(self):
        parking_lots = ParkingLot.query.all()
        return parking_lots

    @auth_required('token')
    def post(self):
        if not current_user.has_role('admin'):
            return {'message': 'Permission denied, only admin can create parking lots'}, 403

        data = request.get_json()
        if not data:
            return {'message': 'No input data provided'}, 400

        required_fields = ['location', 'address', 'pincode', 'total_slots', 'price']
        if not all(field in data for field in required_fields):
            return {'message': 'Missing required fields'}, 400

        try:
            new_parking_lot = ParkingLot(
                location=data.get('location'),
                address=data.get('address'),
                pincode=data.get('pincode'),
                total_slots=data.get('total_slots'),
                price=data.get('price')
            )
            db.session.add(new_parking_lot)
            db.session.commit()

            spots = []
            for _ in range(new_parking_lot.total_slots):
                spot = ParkingSpot(
                    plot_id=new_parking_lot.plot_id,
                    status=False  # By default, spot is available
                )
                spots.append(spot)

            db.session.bulk_save_objects(spots)
            db.session.commit()

            return {'message': 'Parking lot and spots created successfully'}, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Error creating parking lot: {str(e)}'}, 500

UserList_fields = {
    'user_id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'mobile_num': fields.String,
    'age': fields.Integer,
    'roles': fields.List(fields.String, attribute='role_names')
}

class UserListAPI(Resource):

    @auth_required('token')
    @marshal_with(UserList_fields)
    def get(self):
        query = request.args.get('query', '')
        # Only return users with the 'user' role and who are active
        if query:
            users = User.query.join(UserRoles).join(Role).filter(
                Role.name == 'user',
                User.active == True,
                User.username.ilike(f'%{query}%')
            ).all()
        else:
            users = User.query.join(UserRoles).join(Role).filter(
                Role.name == 'user',
                User.active == True
            ).all()
        return users

    @property
    def role_names(self):
        return [role.name for role in self.roles]

# Register resources with the API
api.add_resource(ParkingLotAPI, '/parking_lot/<plot_id>')
api.add_resource(ParkingLotListAPI, '/parking_lots')
api.add_resource(UserListAPI, '/users')