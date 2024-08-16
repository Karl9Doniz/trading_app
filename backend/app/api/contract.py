from flask_restx import Namespace, Resource, fields
from app.models import Contract
from app.extensions import db

api = Namespace('contracts', description='Operations related to contracts')

contract_model = api.model('Contract', {
    'contract_id': fields.Integer(readonly=True),
    'contract_number': fields.String(required=True, description='Contract number'),
})

@api.route('/')
class ContractList(Resource):
    @api.doc('list_contracts')
    @api.marshal_list_with(contract_model)
    def get(self):
        return Contract.query.all()

    @api.doc('create_contract')
    @api.expect(contract_model)
    @api.marshal_with(contract_model, code=201)
    def post(self):
        new_contract = Contract(
            contract_number=api.payload['contract_number']
        )
        db.session.add(new_contract)
        db.session.commit()
        return new_contract, 201

@api.route('/<int:id>')
@api.param('id', 'The contract identifier')
@api.response(404, 'Contract not found')
class ContractItem(Resource):
    @api.doc('get_contract')
    @api.marshal_with(contract_model)
    def get(self, id):
        return Contract.query.get_or_404(id)

    @api.doc('delete_contract')
    @api.response(204, 'Contract deleted')
    def delete(self, id):
        contract = Contract.query.get_or_404(id)
        db.session.delete(contract)
        db.session.commit()
        return '', 204

    @api.doc('update_contract')
    @api.expect(contract_model)
    @api.marshal_with(contract_model)
    def put(self, id):
        contract = Contract.query.get_or_404(id)
        contract.contract_number = api.payload['contract_number']
        db.session.commit()
        return contract
