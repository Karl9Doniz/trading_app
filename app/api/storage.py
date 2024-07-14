from flask_restx import Namespace, Resource, fields
from app.models import Storage
from app.extensions import db

api = Namespace('storages', description='Storage operations')

storage_model = api.model('Storage', {
    'storage_id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'location': fields.String(required=True),
    'capacity': fields.Float(required=True),
})

@api.route('/')
class StorageList(Resource):
    @api.doc('list_storages')
    @api.marshal_list_with(storage_model)
    def get(self):
        return Storage.query.all()

    @api.doc('create_storage')
    @api.expect(storage_model)
    @api.marshal_with(storage_model, code=201)
    def post(self):
        new_storage = Storage(
            name=api.payload['name'],
            location=api.payload.get('location'),
            capacity=api.payload.get('capacity')
        )
        db.session.add(new_storage)
        db.session.commit()
        return new_storage, 201

@api.route('/<int:id>')
@api.param('id', 'The storage identifier')
@api.response(404, 'Storage not found')
class StorageItem(Resource):
    @api.doc('get_storage')
    @api.marshal_with(storage_model)
    def get(self, id):
        return Storage.query.get_or_404(id)
