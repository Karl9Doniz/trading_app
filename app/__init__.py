from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, jwt
from .api import api
from datetime import timedelta

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(f'config.{config_name.capitalize()}Config')

    # JWT settings
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)


    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    api.init_app(app)

    return app