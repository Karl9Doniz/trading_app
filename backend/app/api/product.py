from flask_restx import Namespace, Resource, fields
from app.models import Product
from app.extensions import db

api = Namespace('products', description='Product operations')

product_model = api.model('Product', {
    'product_id': fields.Integer(readonly=True, description='The product unique identifier'),
    'name': fields.String(required=True, description='The product name'),
    'description': fields.String(description='The product description'),
    'unit_price': fields.Float(required=True, description='The product unit price'),
    'current_stock': fields.Float(description='The current stock'),
    'unit_of_measure': fields.String(required=True, description='The unit of measure')
})

@api.route('/')
class ProductList(Resource):
    @api.doc('list_products')
    @api.marshal_list_with(product_model)
    def get(self):
        '''List all products'''
        return Product.query.all()

    @api.doc('create_product')
    @api.expect(product_model)
    @api.marshal_with(product_model, code=201)
    def post(self):
        '''Create a new product'''
        new_product = Product(
            name=api.payload['name'],
            description=api.payload.get('description'),
            unit_price=api.payload['unit_price'],
            current_stock=api.payload.get('current_stock', 0),
            unit_of_measure=api.payload['unit_of_measure']
        )
        db.session.add(new_product)
        db.session.commit()
        return new_product, 201

@api.route('/<int:id>')
@api.param('id', 'The product identifier')
@api.response(404, 'Product not found')
class ProductItem(Resource):
    @api.doc('get_product')
    @api.marshal_with(product_model)
    def get(self, id):
        '''Fetch a product given its identifier'''
        return Product.query.get_or_404(id)