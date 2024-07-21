from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required
from app.models import IncomingInvoice, IncomingInvoiceItem, Product
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

        # Create the invoice first
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
        db.session.flush()  # This assigns an ID to new_invoice

        # Now add items and create products if necessary
        for item_data in data.get('items', []):
            # Check if the product exists, if not create it
            product = Product.query.filter_by(name=item_data['product_name']).first()
            if not product:
                product = Product(
                    name=item_data['product_name'],
                    unit_price=item_data['unit_price'],
                    unit_of_measure=item_data['unit_of_measure']
                )
                db.session.add(product)
                db.session.flush()

            # Create the invoice item
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

# ... rest of the code remains the same

@api.route('/<int:id>')
@api.param('id', 'The incoming invoice identifier')
@api.response(404, 'Incoming Invoice not found')
class IncomingInvoiceID(Resource):
    @api.doc('get_incoming_invoice')
    @api.marshal_with(incoming_invoice_model)
    @jwt_required()
    def get(self, id):
        invoice = IncomingInvoice.query.filter_by(incoming_invoice_id=id).first_or_404()
        return invoice

    @api.doc('update_incoming_invoice')
    @api.expect(incoming_invoice_model)
    @api.marshal_with(incoming_invoice_model)
    @jwt_required()
    def patch(self, id):
        invoice = IncomingInvoice.query.filter_by(incoming_invoice_id=id).first_or_404()
        data = api.payload
        for key, value in data.items():
            setattr(invoice, key, value)
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