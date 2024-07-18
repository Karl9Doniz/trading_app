from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required
from app.models import IncomingInvoiceItem
from app.extensions import db

api = Namespace('incoming_invoice_items', description='Incoming Invoice Item operations')

incoming_invoice_item_model = api.model('IncomingInvoiceItem', {
    'incoming_invoice_item_id': fields.Integer(readonly=True),
    'incoming_invoice_id': fields.Integer(required=True),
    'product_id': fields.Integer(required=True),
    'quantity': fields.Float(required=True),
    'unit_of_measure': fields.String(required=True),
    'unit_price': fields.Float(required=True),
    'total_price': fields.Float(required=True),
    'vat_percentage': fields.Float(required=True),
    'vat_amount': fields.Float(required=True),
    'account_number': fields.String()
})

@api.route('/')
class IncomingInvoiceItemList(Resource):
    @api.doc('list_incoming_invoice_items')
    @api.marshal_list_with(incoming_invoice_item_model)
    def get(self):
        return IncomingInvoiceItem.query.all()

    @api.doc('create_incoming_invoice_item')
    @api.expect(incoming_invoice_item_model)
    @api.marshal_with(incoming_invoice_item_model, code=201)
    def post(self):
        new_item = IncomingInvoiceItem(**api.payload)
        db.session.add(new_item)
        db.session.commit()
        return new_item, 201

@api.route('/<int:id>')
@api.param('id', 'The incoming invoice item identifier')
@api.response(404, 'Incoming Invoice Item not found')
class IncomingInvoiceItemResource(Resource):
    @api.doc('get_incoming_invoice_item')
    @api.marshal_with(incoming_invoice_item_model)
    def get(self, id):
        return IncomingInvoiceItem.query.get_or_404(id)

    @api.doc('update_incoming_invoice_item')
    @api.expect(incoming_invoice_item_model)
    @api.marshal_with(incoming_invoice_item_model)
    @jwt_required()
    def patch(self, id):
        item = IncomingInvoiceItem.query.get_or_404(id)
        data = api.payload
        for key, value in data.items():
            setattr(item, key, value)
        db.session.commit()
        return item

    @api.doc('delete_incoming_invoice_item')
    @api.response(204, 'Incoming Invoice Item deleted')
    def delete(self, id):
        item = IncomingInvoiceItem.query.get_or_404(id)
        db.session.delete(item)
        db.session.commit()
        return '', 204