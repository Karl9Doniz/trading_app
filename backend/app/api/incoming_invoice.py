from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from app.models import IncomingInvoice, IncomingInvoiceItem, Product, Storage
from app.extensions import db

api = Namespace('incoming_invoices', description='Incoming Invoice operations')

incoming_invoice_item_model = api.model('IncomingInvoiceItem', {
    'incoming_invoice_item_id': fields.Integer(readonly=True),
    'product_name': fields.String(required=True),
    'product_description': fields.String(),
    'quantity': fields.Float(required=True),
    'unit_of_measure': fields.String(required=True),
    'unit_price': fields.Float(required=True),
    'total_price': fields.Float(required=True),
    'vat_percentage': fields.Float(required=True),
    'vat_amount': fields.Float(required=True),
    'account_number': fields.String()
})

incoming_invoice_model = api.model('IncomingInvoice', {
    'incoming_invoice_id': fields.Integer(readonly=True),
    'number': fields.String(required=True),
    'date': fields.DateTime(required=True),
    'counter_agent_id': fields.Integer(required=True),
    'operation_type': fields.String(required=True),
    'organization_id': fields.Integer(required=True),
    'storage_id': fields.Integer(required=True),
    'contract_number': fields.String(),
    'responsible_person_id': fields.Integer(required=True),
    'comment': fields.String(),
    'items': fields.List(fields.Nested(incoming_invoice_item_model))
})

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
class IncomingInvoiceList(Resource):
    @api.doc('list_incoming_invoices')
    @api.marshal_list_with(incoming_invoice_model)
    def get(self):
        return IncomingInvoice.query.all()

    @api.doc('create_incoming_invoice')
    @api.expect(incoming_invoice_model)
    @api.marshal_with(incoming_invoice_model, code=201)
    @jwt_required()
    def post(self):
        data = api.payload

        new_invoice = IncomingInvoice(
            number=data['number'],
            date=data['date'],
            counter_agent_id=data['counter_agent_id'],
            operation_type=data['operation_type'],
            organization_id=data['organization_id'],
            storage_id=data['storage_id'],
            contract_number=data.get('contract_number'),
            responsible_person_id=data['responsible_person_id'],
            comment=data.get('comment')
        )
        db.session.add(new_invoice)
        db.session.flush()

        for item_data in data.get('items', []):
            product = Product.query.filter_by(name=item_data['product_name']).first()
            if not product:
                product = Product(
                    name=item_data['product_name'],
                    unit_price=item_data['unit_price'],
                    unit_of_measure=item_data['unit_of_measure'],
                    current_stock=item_data['quantity'],
                    date=new_invoice.date,
                    storage_id=new_invoice.storage_id  # Set the storage ID
                )
                db.session.add(product)
            else:
                product.current_stock += item_data['quantity']
                product.date = new_invoice.date  # Update the date for existing products
                product.storage_id = new_invoice.storage_id  # Update the storage ID for existing products

            new_item = IncomingInvoiceItem(
                incoming_invoice_id=new_invoice.incoming_invoice_id,
                product_name=item_data['product_name'],
                product_description=item_data.get('product_description'),
                quantity=item_data['quantity'],
                unit_of_measure=item_data['unit_of_measure'],
                unit_price=item_data['unit_price'],
                total_price=item_data['total_price'],
                vat_percentage=item_data['vat_percentage'],
                vat_amount=item_data['vat_amount'],
                account_number=item_data.get('account_number')
            )
            db.session.add(new_item)

        db.session.commit()
        return new_invoice, 201

@api.route('/<int:id>')
@api.param('id', 'The incoming invoice identifier')
@api.response(404, 'Incoming Invoice not found')
class IncomingInvoiceID(Resource):
    @api.doc('get_incoming_invoice')
    @api.marshal_with(incoming_invoice_model)
    def get(self, id):
        invoice = IncomingInvoice.query.filter_by(incoming_invoice_id=id).first_or_404()
        return invoice

    @api.doc('update_incoming_invoice')
    @api.expect(incoming_invoice_model)
    @api.marshal_with(incoming_invoice_model)
    def patch(self, id):
        invoice = IncomingInvoice.query.filter_by(incoming_invoice_id=id).first_or_404()
        data = api.payload

        for key, value in data.items():
            if key != 'items':
                setattr(invoice, key, value)

        if 'items' in data:
            existing_items = {item.product_name: item for item in invoice.items}

            for item in invoice.items:
                if item.product_name not in [i['product_name'] for i in data['items']]:
                    db.session.delete(item)

            for item_data in data['items']:
                existing_item = existing_items.get(item_data['product_name'])

                if existing_item:
                    for key, value in item_data.items():
                        setattr(existing_item, key, value)
                else:
                    new_item = IncomingInvoiceItem(
                        incoming_invoice_id=id,
                        product_name=item_data['product_name'],
                        product_description=item_data.get('product_description'),
                        quantity=item_data['quantity'],
                        unit_of_measure=item_data['unit_of_measure'],
                        unit_price=item_data['unit_price'],
                        total_price=item_data['total_price'],
                        vat_percentage=item_data['vat_percentage'],
                        vat_amount=item_data['vat_amount'],
                        account_number=item_data.get('account_number')
                    )
                    db.session.add(new_item)

                    product = Product.query.filter_by(name=item_data['product_name']).first()
                    if not product:
                        product = Product(
                            name=item_data['product_name'],
                            unit_price=item_data['unit_price'],
                            unit_of_measure=item_data['unit_of_measure'],
                            description=item_data.get('product_description'),
                            current_stock=item_data['quantity'],
                            date=invoice.date,
                            storage_id=invoice.storage_id  # Set the storage ID for new products
                        )
                        db.session.add(product)
                    else:
                        product.current_stock += item_data['quantity']
                        product.date = invoice.date  # Update the date for existing products
                        product.storage_id = invoice.storage_id  # Update the storage ID for existing products

        db.session.commit()
        return invoice

    @api.doc('delete_incoming_invoice')
    @api.response(204, 'Incoming Invoice deleted')
    @jwt_required()
    def delete(self, id):
        invoice = IncomingInvoice.query.filter_by(incoming_invoice_id=id).first_or_404()
        db.session.delete(invoice)
        db.session.commit()
        return '', 204

@api.route('/by-date-and-storage')
class ProductsByDateAndStorage(Resource):
    @api.doc('get_products_by_date_and_storage')
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

        products_by_storage = db.session.query(Product, Storage.name.label('storage_name')) \
            .join(Storage, Product.storage_id == Storage.storage_id) \
            .filter(db.func.date(Product.date) == filter_date) \
            .all()

        result = []
        for product, storage_name in products_by_storage:
            product_dict = {
                'product_id': product.product_id,
                'name': product.name,
                'description': product.description,
                'unit_price': product.unit_price,
                'current_stock': product.current_stock,
                'unit_of_measure': product.unit_of_measure,
                'date': product.date,
                'storage_id': product.storage_id,
                'storage_name': storage_name
            }
            result.append(product_dict)

        return result
