from flask_restx import Namespace, Resource, fields
from flask import request
from app.models import Product
from app.extensions import db
from datetime import datetime
from sqlalchemy import func

api = Namespace('products', description='Product operations')

product_model = api.model('Product', {
    'product_id': fields.Integer(readonly=True, description='The product unique identifier'),
    'name': fields.String(required=True, description='The product name'),
    'description': fields.String(description='The product description'),
    'unit_price': fields.Float(required=True, description='The product unit price'),
    'current_stock': fields.Float(description='The current stock'),
    'unit_of_measure': fields.String(required=True, description='The unit of measure'),
    'date': fields.DateTime(required=True, description='The creation date'),
    'storage_id': fields.Integer(description='The storage identifier')  # Include storage ID
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
            unit_of_measure=api.payload['unit_of_measure'],
            date=datetime.utcnow(),
            storage_id=api.payload.get('storage_id')  # Set storage ID if provided
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

@api.route('/by-date')
class ProductsByDate(Resource):
    @api.doc('get_products_by_date')
    @api.param('date', 'The date to filter products (YYYY-MM-DD)')
    @api.marshal_list_with(product_model)
    def get(self):
        date_str = request.args.get('date')
        if not date_str:
            return [], 400

        try:
            filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return [], 400

        products = Product.query.filter(func.date(Product.date) == filter_date).all()

        return products
