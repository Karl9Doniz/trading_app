import decimal
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from app.models import OutgoingInvoice, OutgoingInvoiceItem, Product, Customer
from app.extensions import db
from decimal import Decimal, InvalidOperation

api = Namespace('outgoing_invoices', description='Outgoing Invoice operations')

outgoing_invoice_item_model = api.model('OutgoingInvoiceItem', {
    'outgoing_invoice_item_id': fields.Integer(readonly=True),
    'product_name': fields.String(required=True),
    'product_description': fields.String(),
    'quantity': fields.Float(required=True),
    'unit_of_measure': fields.String(required=True),
    'unit_price': fields.Float(required=True),
    'total_price': fields.Float(required=True),
    'vat_percentage': fields.Float(required=True),
    'vat_amount': fields.Float(required=True),
    'discount': fields.Float(),
    'account_number': fields.String()
})

outgoing_invoice_model = api.model('OutgoingInvoice', {
    'outgoing_invoice_id': fields.Integer(readonly=True),
    'number': fields.String(readonly=True),
    'date': fields.DateTime(required=True),
    'customer_id': fields.Integer(required=True),
    'organization_id': fields.Integer(required=True),
    'contract_id': fields.Integer(required=True),
    'storage_id': fields.Integer(required=True),
    'responsible_person_id': fields.Integer(required=True),
    'contract_number': fields.String(),
    'payment_document': fields.String(),
    'comment': fields.String(),
    'items': fields.List(fields.Nested(outgoing_invoice_item_model))
})

@api.route('/')
class OutgoingInvoiceList(Resource):
    @api.doc('list_outgoing_invoices')
    @api.marshal_list_with(outgoing_invoice_model)
    def get(self):
        return OutgoingInvoice.query.all()

    @api.doc('create_outgoing_invoice')
    @api.expect(outgoing_invoice_model)
    @api.marshal_with(outgoing_invoice_model, code=201)
    def post(self):
        data = api.payload
        # Generate the invoice number
        last_invoice = OutgoingInvoice.query.order_by(OutgoingInvoice.outgoing_invoice_id.desc()).first()
        new_id = (last_invoice.outgoing_invoice_id if last_invoice else 0) + 1
        new_number = f"out{new_id:03}"

        new_invoice = OutgoingInvoice(
            number=new_number,
            date=data['date'],
            customer_id=data['customer_id'],
            organization_id=data['organization_id'],
            contract_id=data['contract_id'],
            storage_id=data['storage_id'],
            responsible_person_id=data['responsible_person_id'],
            payment_document=data.get('payment_document'),
            comment=data.get('comment')
        )
        db.session.add(new_invoice)
        db.session.flush()

        for item_data in data.get('items', []):
            product = Product.query.filter_by(name=item_data['product_name']).first()
            if not product:
                api.abort(400, f"Product with name '{item_data['product_name']}' not found")

            quantity = Decimal(str(item_data['quantity']))
            if product.current_stock < quantity:
                api.abort(400, f"Not enough stock for product {product.name}. Available: {product.current_stock}, Requested: {quantity}")

            unit_price = Decimal(str(item_data['unit_price']))
            total_price = quantity * unit_price

            vat_percentage = item_data.get('vat_percentage', 20)
            print(vat_percentage)
            try:
                vat_percentage = Decimal(vat_percentage)
            except (TypeError, ValueError, InvalidOperation):
                vat_percentage = Decimal('20')

            vat_amount = total_price / 6 if vat_percentage > 0 else Decimal('0')

            discount = Decimal(str(item_data.get('discount', '0')))
            if discount > 0:
                total_price = total_price * (1 - discount / 100)

            new_item = OutgoingInvoiceItem(
                outgoing_invoice_id=new_invoice.outgoing_invoice_id,
                product_name=product.name,
                product_description=item_data.get('product_description'),
                quantity=quantity,
                unit_of_measure=item_data['unit_of_measure'],
                unit_price=unit_price,
                total_price=total_price,
                vat_percentage=vat_percentage,
                vat_amount=vat_amount,
                discount=discount,
                account_number=item_data.get('account_number')
            )
            db.session.add(new_item)
            product.current_stock -= quantity

        db.session.commit()
        return new_invoice, 201

@api.route('/<int:id>')
@api.param('id', 'The outgoing invoice identifier')
@api.response(404, 'Outgoing Invoice not found')
class OutgoingInvoiceID(Resource):
    @api.doc('get_outgoing_invoice')
    @api.marshal_with(outgoing_invoice_model)
    def get(self, id):
        invoice = OutgoingInvoice.query.filter_by(outgoing_invoice_id=id).first_or_404()
        return invoice

    @api.doc('update_outgoing_invoice')
    @api.expect(outgoing_invoice_model)
    @api.marshal_with(outgoing_invoice_model)
    def patch(self, id):
        invoice = OutgoingInvoice.query.filter_by(outgoing_invoice_id=id).first_or_404()
        data = api.payload

        for key, value in data.items():
            if key != 'items':
                setattr(invoice, key, value)

        if 'items' in data:
            for item in invoice.items:
                product = Product.query.filter_by(name=item.product_name).first()
                product.current_stock += item.quantity

            OutgoingInvoiceItem.query.filter_by(outgoing_invoice_id=id).delete()

            for item_data in data['items']:
                product = Product.query.filter_by(name=item_data['product_name']).first()
                if not product:
                    api.abort(400, f"Product with name '{item_data['product_name']}' not found")

                quantity = Decimal(str(item_data['quantity']))
                if product.current_stock < quantity:
                    api.abort(400, f"Not enough stock for product {product.name}. Available: {product.current_stock}, Requested: {quantity}")

                unit_price = Decimal(str(item_data['unit_price']))
                total_price = quantity * unit_price
                vat_percentage = item_data.get('vat_percentage')
                if vat_percentage is not None:
                    try:
                        vat_percentage = Decimal(str(vat_percentage))
                    except (TypeError, ValueError, decimal.InvalidOperation):
                        vat_percentage = Decimal('20.0')
                    else:
                        vat_percentage = Decimal('20.0')
                vat_amount = total_price / 6 if vat_percentage > 0 else Decimal('0')

                discount = Decimal(str(item_data.get('discount', '0')))
                if discount > 0:
                    total_price = total_price * (1 - discount / 100)

                new_item = OutgoingInvoiceItem(
                    outgoing_invoice_id=id,
                    product_name=product.name,
                    product_description=item_data.get('product_description'),
                    quantity=quantity,
                    unit_of_measure=item_data['unit_of_measure'],
                    unit_price=unit_price,
                    total_price=total_price,
                    vat_percentage=vat_percentage,
                    vat_amount=vat_amount,
                    discount=discount,
                    account_number=item_data.get('account_number')
                )
                db.session.add(new_item)
                product.current_stock -= quantity

        db.session.commit()
        return invoice

    @api.doc('delete_outgoing_invoice')
    @api.response(204, 'Outgoing Invoice deleted')
    def delete(self, id):
        invoice = OutgoingInvoice.query.filter_by(outgoing_invoice_id=id).first_or_404()

        for item in invoice.items:
            product = Product.query.filter_by(name=item.product_name).first()
            product.current_stock += item.quantity

        db.session.delete(invoice)
        db.session.commit()
        return '', 204

@api.route('/next-invoice-number')
class NextInvoiceNumber(Resource):
    def get(self):
        last_invoice = OutgoingInvoice.query.order_by(OutgoingInvoice.outgoing_invoice_id.desc()).first()
        new_id = (last_invoice.outgoing_invoice_id if last_invoice else 0) + 1
        new_number = f"out{new_id:03}"
        return {'next_invoice_number': new_number}