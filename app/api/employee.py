from flask_restx import Namespace, Resource, fields
from app.models import Employee
from app.extensions import db

api = Namespace('employees', description='Employee operations')

employee_model = api.model('Employee', {
    'employee_id': fields.Integer(readonly=True),
    'first_name': fields.String(required=True),
    'last_name': fields.String(required=True),
    'position': fields.String(),
})


@api.route('/')
class EmployeeList(Resource):
    @api.doc('list_employees')
    @api.marshal_list_with(employee_model)
    def get(self):
        return Employee.query.all()

    @api.doc('create_employee')
    @api.expect(employee_model)
    @api.marshal_with(employee_model, code=201)
    def post(self):
        new_employee = Employee(
            first_name=api.payload['first_name'],
            last_name=api.payload['last_name'],
            position=api.payload.get('position')
        )
        db.session.add(new_employee)
        db.session.commit()
        return new_employee, 201

@api.route('/<int:id>')
@api.param('id', 'The employee identifier')
@api.response(404, 'Employee not found')
class EmployeeItem(Resource):
    @api.doc('get_employee')
    @api.marshal_with(employee_model)
    def get(self, id):
        return Employee.query.get_or_404(id)