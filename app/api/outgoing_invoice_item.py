from flask_restx import Namespace, Resource, fields
# from flask_jwt_extended import jwt_required
from app.models import OutgoingInvoiceItem
from app.extensions import db

api = Namespace('outgoing_invoice_items', description='Outgoing Invoice Item operations')

outgoing_invoice_item_model = api.model('OutgoingInvoiceItem', {
    'outgoing_invoice_item_id': fields.Integer(readonly=True),
    'outgoing_invoice_id': fields.Integer(required=True),
    'product_id': fields.Integer(),
    'service_id': fields.Integer(),
    'quantity': fields.Float(required=True),
    'unit_of_measure': fields.String(required=True),
    'unit_price': fields.Float(required=True),
    'total_price': fields.Float(required=True),
    'vat_percentage': fields.Float(required=True),
    'vat_amount': fields.Float(required=True),
    'discount': fields.Float(),
    'account_number': fields.String()
})

@api.route('/')
class OutgoingInvoiceItemList(Resource):
    @api.doc('list_outgoing_invoice_items')
    @api.marshal_list_with(outgoing_invoice_item_model)
    def get(self):
        return OutgoingInvoiceItem.query.all()

    @api.doc('create_outgoing_invoice_item')
    @api.expect(outgoing_invoice_item_model)
    @api.marshal_with(outgoing_invoice_item_model, code=201)
    def post(self):
        new_item = OutgoingInvoiceItem(**api.payload)
        db.session.add(new_item)
        db.session.commit()
        return new_item, 201

@api.route('/<int:id>')
@api.param('id', 'The outgoing invoice item identifier')
@api.response(404, 'Outgoing Invoice Item not found')
class IncomingInvoiceItemResource(Resource):
    @api.doc('get_outgoing_invoice_item')
    @api.marshal_with(outgoing_invoice_item_model)
    def get(self, id):
        return OutgoingInvoiceItem.query.get_or_404(id)

    @api.doc('update_outgoing_invoice_item')
    @api.expect(outgoing_invoice_item_model)
    @api.marshal_with(outgoing_invoice_item_model)
    def patch(self, id):
        item = OutgoingInvoiceItem.query.get_or_404(id)
        data = api.payload
        for key, value in data.items():
            setattr(item, key, value)
        db.session.commit()
        return item

    @api.doc('delete_outgoing_invoice_item')
    @api.response(204, 'Outgoing Invoice Item deleted')
    def delete(self, id):
        item = OutgoingInvoiceItem.query.get_or_404(id)
        db.session.delete(item)
        db.session.commit()
        return '', 204