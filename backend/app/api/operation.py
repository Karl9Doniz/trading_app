from flask_restx import Namespace, Resource, fields
from app.models import Operation
from app.extensions import db

api = Namespace('operations', description='Operations related to business processes')

operation_model = api.model('Operation', {
    'operation_id': fields.Integer(readonly=True),
    'operation_type': fields.String(required=True, description='Type of operation'),
})

@api.route('/')
class OperationList(Resource):
    @api.doc('list_operations')
    @api.marshal_list_with(operation_model)
    def get(self):
        return Operation.query.all()

    @api.doc('create_operation')
    @api.expect(operation_model)
    @api.marshal_with(operation_model, code=201)
    def post(self):
        new_operation = Operation(
            operation_type=api.payload['operation_type']
        )
        db.session.add(new_operation)
        db.session.commit()
        return new_operation, 201

@api.route('/<int:id>')
@api.param('id', 'The operation identifier')
@api.response(404, 'Operation not found')
class OperationItem(Resource):
    @api.doc('get_operation')
    @api.marshal_with(operation_model)
    def get(self, id):
        return Operation.query.get_or_404(id)

    @api.doc('delete_operation')
    @api.response(204, 'Operation deleted')
    def delete(self, id):
        operation = Operation.query.get_or_404(id)
        db.session.delete(operation)
        db.session.commit()
        return '', 204

    @api.doc('update_operation')
    @api.expect(operation_model)
    @api.marshal_with(operation_model)
    def put(self, id):
        operation = Operation.query.get_or_404(id)
        operation.operation_type = api.payload['operation_type']
        db.session.commit()
        return operation
