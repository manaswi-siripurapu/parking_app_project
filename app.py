from flask import Flask
from backend.config import LocalDevelopmentConfig

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    return app

app = create_app()

@app.route('/')
def home():
    return "Welcome to the Parking App home!"

if(__name__ == '__main__'):
    app.run()