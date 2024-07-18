from flask_restx import Namespace, Resource, fields
from app.models import Customer
from app.extensions import db

api = Namespace('customers', description='Customer operations')

customer_model = api.model('Customer', {
    'customer_id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'contact_info': fields.String(),
    'address': fields.String(),
})

@api.route('/')
class CustomerList(Resource):
    @api.doc('list_customers')
    @api.marshal_list_with(customer_model)
    def get(self):
        return Customer.query.all()

    @api.doc('create_customer')
    @api.expect(customer_model)
    @api.marshal_with(customer_model, code=201)
    def post(self):
        new_customer = Customer(
            name=api.payload['name'],
            contact_info=api.payload.get('contact_info'),
            address=api.payload.get('address')
        )
        db.session.add(new_customer)
        db.session.commit()
        return new_customer, 201

@api.route('/<int:id>')
@api.param('id', 'The customer identifier')
@api.response(404, 'Customer not found')
class CustomerItem(Resource):
    @api.doc('get_customer')
    @api.marshal_with(customer_model)
    def get(self, id):
        return Customer.query.get_or_404(id)