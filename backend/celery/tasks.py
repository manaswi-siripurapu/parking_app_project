from celery import shared_task
import time
import flask_excel
from backend.models import ParkingLot

@shared_task(ignore_results = False)
def add(x,y):
    time.sleep(10)
    return x+y

@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    resource = ParkingLot.query.all()

    task_id = self.request.id
    filename = f'ParkingLot_data_{task_id}.csv'
    column_names = [column.name for column in ParkingLot.__table__.columns]
    print(column_names)
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv' )

    with open(f'./backend/celery/user-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)
    
    return filename