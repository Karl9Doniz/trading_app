from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import IncomingInvoice
from app.extensions import db

api = Namespace('incoming_invoices', description='Incoming Invoice operations')

incoming_invoice_model = api.model('IncomingInvoice', {
    'incoming_invoice_id': fields.Integer(readonly=True),
    'number': fields.String(required=True),
    'date': fields.DateTime(required=True),
    'counter_agent_id': fields.Integer(required=True),
    'operation_type': fields.String(required=True),
    'organization_id': fields.Integer(required=True),
    'storage_id': fields.Integer(required=True),
    'contract_number': fields.String(),
    'total_amount': fields.Float(required=True),
    'total_vat': fields.Float(required=True),
    'responsible_person_id': fields.Integer(required=True),
    'comment': fields.String()
})

@api.route('/')
class IncomingInvoiceList(Resource):
    @api.doc('list_incoming_invoices')
    @api.marshal_list_with(incoming_invoice_model)
    @jwt_required()
    def get(self):
        return IncomingInvoice.query.all()

    @api.doc('create_incoming_invoice')
    @api.expect(incoming_invoice_model)
    @api.marshal_with(incoming_invoice_model, code=201)
    @jwt_required()
    def post(self):
        new_invoice = IncomingInvoice(**api.payload)
        db.session.add(new_invoice)
        db.session.commit()
        return new_invoice, 201

@api.route('/<int:id>')
@api.param('id', 'The incoming invoice identifier')
@api.response(404, 'Incoming Invoice not found')
class IncomingInvoiceItem(Resource):
    @api.doc('get_incoming_invoice')
    @api.marshal_with(incoming_invoice_model)
    @jwt_required()
    def get(self, id):
        return IncomingInvoice.query.get_or_404(id)

    @api.doc('update_incoming_invoice')
    @api.expect(incoming_invoice_model)
    @api.marshal_with(incoming_invoice_model)
    @jwt_required()
    def patch(self, id):
        invoice = IncomingInvoice.query.get_or_404(id)
        data = api.payload
        for key, value in data.items():
            setattr(invoice, key, value)
        db.session.commit()
        return invoice

    @api.doc('delete_incoming_invoice')
    @api.response(204, 'Incoming Invoice deleted')
    @jwt_required()
    def delete(self, id):
        invoice = IncomingInvoice.query.get_or_404(id)
        db.session.delete(invoice)
        db.session.commit()
        return '', 204