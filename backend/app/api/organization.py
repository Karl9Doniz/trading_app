from flask_restx import Namespace, Resource, fields
from app.models import Organization
from app.extensions import db

api = Namespace('organizations', description='Organization operations')

org_model = api.model('Organization', {
    'organization_id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
})

@api.route('/')
class OrganizationList(Resource):
    @api.doc('list_organizations')
    @api.marshal_list_with(org_model)
    def get(self):
        return Organization.query.all()

    @api.doc('create_organization')
    @api.expect(org_model)
    @api.marshal_with(org_model, code=201)
    def post(self):
        new_org = Organization(name=api.payload['name'])
        db.session.add(new_org)
        db.session.commit()
        return new_org, 201

@api.route('/<int:id>')
@api.param('id', 'The organization identifier')
@api.response(404, 'Organization not found')
class OrganizationItem(Resource):
    @api.doc('get_organization')
    @api.marshal_with(org_model)
    def get(self, id):
        return Organization.query.get_or_404(id)