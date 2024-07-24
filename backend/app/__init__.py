import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from .extensions import db, migrate, jwt_manager
from .api import api
from datetime import timedelta

def create_app(config_name='production'):
    app = Flask(__name__, static_folder='../../frontend/build', static_url_path='')
    app.config.from_object(f'config.{config_name.capitalize()}Config')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt_manager.init_app(app)
    api.init_app(app)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + '/' + path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app