from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    db.init_app(app)

    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore = datastore)
    app.app_context().push()

    return app

app = create_app()

import backend.create_initial_data

@app.route('/')
def home():
    return "Welcome to the Parking App home!"

if(__name__ == '__main__'):
    app.run()