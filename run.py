from app import create_app, db
from flask.cli import FlaskGroup

cli = FlaskGroup(create_app=create_app)

if __name__ == '__main__':
    cli()