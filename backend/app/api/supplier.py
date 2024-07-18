from flask_restx import Namespace, Resource, fields
from app.models import Supplier
from app.extensions import db

api = Namespace('suppliers', description='Supplier operations')

supplier_model = api.model('Supplier', {
    'supplier_id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'contact_info': fields.String(),
    'address': fields.String(),
})

@api.route('/')
class SupplierList(Resource):
    @api.doc('list_suppliers')
    @api.marshal_list_with(supplier_model)
    def get(self):
        return Supplier.query.all()

    @api.doc('create_supplier')
    @api.expect(supplier_model)
    @api.marshal_with(supplier_model, code=201)
    def post(self):
        new_supplier = Supplier(
            name=api.payload['name'],
            contact_info=api.payload.get('contact_info'),
            address=api.payload.get('address')
        )
        db.session.add(new_supplier)
        db.session.commit()
        return new_supplier, 201

@api.route('/<int:id>')
@api.param('id', 'The supplier identifier')
@api.response(404, 'Supplier not found')
class SupplierItem(Resource):
    @api.doc('get_supplier')
    @api.marshal_with(supplier_model)
    def get(self, id):
        return Supplier.query.get_or_404(id)