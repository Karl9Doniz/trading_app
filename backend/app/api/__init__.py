from flask_restx import Api
from .organization import api as org_api
from .storage import api as storage_api
from .employee import api as employee_api
from .supplier import api as supplier_api
from .product import api as product_api
from .customer import api as customer_api
from .incoming_invoice import api as incoming_invoice_api
# from .incoming_invoice_item import api as incoming_invoice_item_api
from .outgoing_invoice import api as outgoing_invoice_api
from .outgoing_invoice_item import api as outgoing_invoice_item_api
from .user import auth_ns as user_api

authorizations = {
    'Bearer Auth': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization'
    },
}

api = Api(
    title='Inventory Management API',
    version='1.0',
    description='A comprehensive inventory management API',
    doc='/doc/',
    authorizations=authorizations,
    security='Bearer Auth'
)



api.add_namespace(org_api, path='/api/organizations')
api.add_namespace(storage_api, path='/api/storages')
api.add_namespace(employee_api, path='/api/employees')
api.add_namespace(supplier_api, path='/api/suppliers')
api.add_namespace(product_api, path='/api/products')
api.add_namespace(customer_api, path='/api/customers')
api.add_namespace(incoming_invoice_api, path='/api/incoming-invoices')
# api.add_namespace(incoming_invoice_item_api, path='/api/incoming-invoice-items')
api.add_namespace(outgoing_invoice_api, path='/api/outgoing-invoices')
api.add_namespace(outgoing_invoice_item_api, path='/api/outgoing-invoice-items')
api.add_namespace(user_api, path='/api/user')