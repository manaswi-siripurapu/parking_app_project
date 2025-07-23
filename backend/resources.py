from flask_restful import Resource, Api, fields, marshal_with
from backend.models import ParkingLot, ParkingSpot, Booking, User, Role, UserRoles, db
from flask_security import auth_required, current_user
from flask import jsonify, request, current_app
from datetime import datetime, timedelta 
from backend.extensions.cache_ext import cache  

api = Api(prefix='/api')

ParkingLot_fields = {
    'plot_id': fields.Integer,
    'location': fields.String,
    'address': fields.String,
    'pincode': fields.String,
    'total_slots': fields.Integer,
    'price': fields.String 
}

UserList_fields = { 
    'user_id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'mobile_num': fields.String,
    'age': fields.Integer,
    'roles': fields.List(fields.String, attribute='role_names') 
}

Booking_fields = {
    'booking_id': fields.Integer,
    'pspot_id': fields.Integer,
    'user_id': fields.Integer,
    'start_time': fields.DateTime(dt_format='iso8601'),
    'end_time': fields.DateTime(dt_format='iso8601', attribute='end_time', default=None),
    'total_cost': fields.String(attribute='total_cost', default="0.00"), 
    'parking_lot_location': fields.String(attribute='parking_spot.parking_lot.location'),
    'parking_spot_id': fields.Integer(attribute='parking_spot.pspot_id'),
    'username': fields.String(attribute='user.username')
}


class ParkingLotAPI(Resource):

    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(ParkingLot_fields)
    def get(self, plot_id):
        """Retrieves details of a single parking lot."""
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
        """Deletes a parking lot. Requires admin role. Checks for existing bookings."""
        try:
            plot_id = int(plot_id)
        except (ValueError, TypeError):
            return {'message': 'Invalid plot_id'}, 400
        
        parking_lot = ParkingLot.query.filter_by(plot_id=plot_id).first()
        if not parking_lot:
            return {'message': 'Parking lot not found'}, 404

        if not current_user.has_role('admin'):
            return {'message': 'Permission denied'}, 403

        spot_ids = [spot.pspot_id for spot in ParkingSpot.query.filter_by(plot_id=plot_id).all()]
        if spot_ids:
            if Booking.query.filter(Booking.pspot_id.in_(spot_ids)).count() > 0:
                return {'message': 'Cannot delete parking lot with existing bookings'}, 400

        try:
            db.session.delete(parking_lot)
            db.session.commit()
            return {'message': 'Parking lot deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error deleting parking lot: {str(e)}'}, 500

    @auth_required('token')
    def patch(self, plot_id):
        """Updates parking lot details. Requires admin. Location/address fixed. Handles slot changes."""
        try:
            plot_id = int(plot_id)
        except (ValueError, TypeError):
            return {'message': 'Invalid plot_id'}, 400

        parking_lot = ParkingLot.query.filter_by(plot_id=plot_id).first()
        if not parking_lot:
            return {'message': 'Parking lot not found'}, 404

        if not current_user.has_role('admin'):
            return {'message': 'Permission denied'}, 403

        data = request.get_json()
        if not data:
            return {'message': 'No input data provided'}, 400

        if 'location' in data or 'address' in data:
            return {'message': 'Location and address cannot be changed.'}, 400

        try:
            if 'pincode' in data:
                parking_lot.pincode = data['pincode']
            if 'price' in data:
                parking_lot.price = data['price'] 
            
            if 'total_slots' in data:
                new_total_slots = data['total_slots']
                if not isinstance(new_total_slots, int) or new_total_slots <= 0:
                    return {'message': 'Total slots must be a positive integer.'}, 400

                current_occupied_spots_count = ParkingSpot.query.filter_by(
                    plot_id=plot_id,
                    status=True
                ).count()

                if new_total_slots < current_occupied_spots_count:
                    return {
                        'message': f'Cannot decrease total slots to {new_total_slots} as {current_occupied_spots_count} spots are currently occupied.'
                    }, 400
                
                if new_total_slots > parking_lot.total_slots:
                    spots_to_add = new_total_slots - parking_lot.total_slots
                    new_spots = []
                    for _ in range(spots_to_add):
                        spot = ParkingSpot(plot_id=parking_lot.plot_id, status=False)
                        new_spots.append(spot)
                    db.session.bulk_save_objects(new_spots)
                
                elif new_total_slots < parking_lot.total_slots:
                    spots_to_remove_count = parking_lot.total_slots - new_total_slots
                    available_spots = ParkingSpot.query.filter_by(
                        plot_id=plot_id,
                        status=False
                    ).order_by(ParkingSpot.pspot_id.desc()).limit(spots_to_remove_count).all()
                    
                    if len(available_spots) < spots_to_remove_count:
                        return {'message': 'Not enough available spots to decrease total slots.'}, 400

                    for spot in available_spots:
                        db.session.delete(spot)

                parking_lot.total_slots = new_total_slots

            db.session.commit() 
            return {'message': 'Parking lot updated successfully'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': f'Error updating parking lot: {str(e)}'}, 500 

class ParkingLotListAPI(Resource):

    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(ParkingLot_fields)
    def get(self):
        """Retrieves a list of all parking lots."""
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
            total_slots = int(data.get('total_slots'))
            price = float(data.get('price')) # Use float for conversion, db.Numeric handles precision
            if total_slots <= 0 or price < 0:
                return {'message': 'Total slots must be positive, price non-negative.'}, 400
        except (ValueError, TypeError):
            return {'message': 'Invalid data type for total_slots or price.'}, 400

        try:
            new_parking_lot = ParkingLot(
                location=data.get('location'),
                address=data.get('address'),
                pincode=data.get('pincode'),
                total_slots=total_slots,
                price=price
            )
            db.session.add(new_parking_lot)
            db.session.commit()

            spots = []
            for _ in range(new_parking_lot.total_slots):
                spot = ParkingSpot(
                    plot_id=new_parking_lot.plot_id,
                    status=False
                )
                spots.append(spot)

            db.session.bulk_save_objects(spots)
            db.session.commit()

            return {'message': 'Parking lot and spots created successfully'}, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Error creating parking lot: {str(e)}'}, 500

class UserListAPI(Resource):

    @auth_required('token')
    @marshal_with(UserList_fields)
    def get(self):
        """Retrieves a list of users. Filters for active 'user' role by default."""
        query_param = request.args.get('query', '').strip()
        
        users_query = User.query.join(UserRoles).join(Role).filter(
            Role.name == 'user',
            User.active == True
        )

        if query_param:
            users_query = users_query.filter(User.username.ilike(f'%{query_param}%'))
        
        users = users_query.all()
        return users

Booking_fields = {
    'booking_id': fields.Integer,
    'pspot_id': fields.Integer,
    'user_id': fields.Integer,
    'start_time': fields.DateTime(dt_format='iso8601'),
    'end_time': fields.DateTime(dt_format='iso8601', attribute='end_time', default=None),
    'total_cost': fields.String(attribute='total_cost', default="0.00"), # FIX: Changed to String for db.Numeric
    'parking_lot_location': fields.String(attribute='parking_spot.parking_lot.location'),
    'parking_spot_id': fields.Integer(attribute='parking_spot.pspot_id'),
    'username': fields.String(attribute='user.username')
}

class BookingAPI(Resource):
    @auth_required('token')
    @marshal_with(Booking_fields)
    def post(self):
        data = request.get_json()
        if not data:
            return {'message': 'No input data provided'}, 400

        required_fields = ['plot_id']
        if not all(field in data for field in required_fields):
            return {'message': 'Missing required fields: plot_id.'}, 400

        try:
            plot_id = int(data.get('plot_id'))
        except (ValueError, TypeError):
            return {'message': 'Invalid data format for plot ID.'}, 400

        parking_lot = ParkingLot.query.filter_by(plot_id=plot_id).first()
        if not parking_lot:
            return {'message': 'Parking lot not found.'}, 404

        parking_spot = ParkingSpot.query.filter_by(
            plot_id=plot_id,
            status=False
        ).order_by(ParkingSpot.pspot_id.asc()).first()

        if not parking_spot:
            return {'message': 'No available parking spots in this lot.'}, 409

        active_booking_by_user = Booking.query.filter_by(
            user_id=current_user.user_id,
            end_time=None
        ).first()
        if active_booking_by_user:
            return {'message': 'You already have an active parking session. Please release your current spot first.'}, 409

        try:
            new_booking = Booking(
                pspot_id=parking_spot.pspot_id,
                user_id=current_user.user_id,
                start_time=datetime.now(),
                end_time=None,
                total_cost=0.0
            )
            db.session.add(new_booking)
            
            parking_spot.status = True
            
            db.session.commit()
            return new_booking, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Error occupying spot: {str(e)}'}, 500

    @auth_required('token')
    @marshal_with(Booking_fields)
    def patch(self, booking_id):
        try:
            booking_id = int(booking_id)
        except (ValueError, TypeError):
            return {'message': 'Invalid booking ID.'}, 400

        booking = Booking.query.filter_by(booking_id=booking_id).first()
        if not booking:
            return {'message': 'Booking not found.'}, 404
        
        if booking.user_id != current_user.user_id:
            return {'message': 'Permission denied: This booking does not belong to you.'}, 403

        if booking.end_time is not None:
            return {'message': 'This booking has already been ended.'}, 400

        parking_spot = ParkingSpot.query.filter_by(pspot_id=booking.pspot_id).first()
        if not parking_spot:
            return {'message': 'Associated parking spot not found.'}, 500
        
        if not parking_spot.status:
            return {'message': 'Parking spot is not currently marked as occupied.'}, 400

        try:
            booking.end_time = datetime.now()
            duration_hours = (booking.end_time - booking.start_time).total_seconds() / 3600.0
            parking_lot_price_per_hour = parking_spot.parking_lot.price
            booking.total_cost = round(duration_hours * parking_lot_price_per_hour, 2)

            parking_spot.status = False
            
            db.session.commit()
            return booking, 200

        except Exception as e:
            db.session.rollback()
            return {'message': f'Error releasing spot: {str(e)}'}, 500

api.add_resource(ParkingLotAPI, '/parking_lot/<int:plot_id>')
api.add_resource(ParkingLotListAPI, '/parking_lots')
api.add_resource(UserListAPI, '/users')
api.add_resource(BookingAPI, '/bookings', '/bookings/<int:booking_id>')
