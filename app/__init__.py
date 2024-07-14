from flask import Flask
from .extensions import db, migrate, jwt
from .api import api
from flask_jwt_extended import JWTManager

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(f'config.{config_name.capitalize()}Config')

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    api.init_app(app)

    return app