from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required
from app.models import OutgoingInvoice
from app.extensions import db

api = Namespace('outgoing_invoices', description='Outgoing Invoice operations')

outgoing_invoice_model = api.model('OutgoingInvoice', {
    'outgoing_invoice_id': fields.Integer(readonly=True),
    'number': fields.String(required=True),
    'date': fields.DateTime(required=True),
    'customer_id': fields.Integer(required=True),
    'operation_type': fields.String(required=True),
    'organization_id': fields.Integer(required=True),
    'storage_id': fields.Integer(required=True),
    'responsible_person_id': fields.Integer(required=True),
    'contract_number': fields.String(),
    'payment_document': fields.String(),
    'comment': fields.String()
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
        new_invoice = OutgoingInvoice(**api.payload)
        db.session.add(new_invoice)
        db.session.commit()
        return new_invoice, 201

@api.route('/<int:id>')
@api.param('id', 'The outgoing invoice identifier')
@api.response(404, 'Outgoing Invoice not found')
class OutgoingInvoiceItem(Resource):
    @api.doc('get_outgoing_invoice')
    @api.marshal_with(outgoing_invoice_model)
    def get(self, id):
        return OutgoingInvoice.query.get_or_404(id)

    @api.doc('update_outgoing_invoice')
    @api.expect(outgoing_invoice_model)
    @api.marshal_with(outgoing_invoice_model)
    def patch(self, id):
        invoice = OutgoingInvoice.query.get_or_404(id)
        data = api.payload
        for key, value in data.items():
            setattr(invoice, key, value)
        db.session.commit()
        return invoice

    @api.doc('delete_outgoing_invoice')
    @api.response(204, 'Outgoing Invoice deleted')
    def delete(self, id):
        invoice = OutgoingInvoice.query.get_or_404(id)
        db.session.delete(invoice)
        db.session.commit()
        return '', 204
