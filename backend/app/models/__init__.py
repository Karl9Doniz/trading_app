from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import relationship

# (Organization, Storage, Employee, Supplier, Product, Service, IncomingInvoice,
# IncomingInvoiceItem, Customer, OutgoingInvoice, OutgoingInvoiceItem, Inventory)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Organization(db.Model):
    __tablename__ = 'organization'
    organization_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Storage(db.Model):
    __tablename__ = 'storage'
    storage_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255))
    capacity = db.Column(db.Numeric)

class Employee(db.Model):
    __tablename__ = 'employee'
    employee_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    position = db.Column(db.String(100))

class Supplier(db.Model):
    __tablename__ = 'supplier'
    supplier_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact_info = db.Column(db.String(255))
    address = db.Column(db.Text)

class Product(db.Model):
    __tablename__ = 'product'
    product_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    current_stock = db.Column(db.Numeric(10, 2), default=0)
    unit_of_measure = db.Column(db.String(20), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    storage_id = db.Column(db.Integer, db.ForeignKey('storage.storage_id'), nullable=False)

    storage = db.relationship('Storage', backref=db.backref('products', lazy=True))


class Service(db.Model):
    __tablename__ = 'service'
    service_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)

class IncomingInvoice(db.Model):
    __tablename__ = 'incominginvoice'
    incoming_invoice_id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(50), unique=True, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    counter_agent_id = db.Column(db.Integer, db.ForeignKey('supplier.supplier_id'))
    operation_type = db.Column(db.String(50), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.organization_id'))
    storage_id = db.Column(db.Integer, db.ForeignKey('storage.storage_id'))
    contract_number = db.Column(db.String(50))
    responsible_person_id = db.Column(db.Integer, db.ForeignKey('employee.employee_id'))
    comment = db.Column(db.Text)
    items = db.relationship('IncomingInvoiceItem', back_populates='invoice', cascade="all, delete-orphan")

class IncomingInvoiceItem(db.Model):
    __tablename__ = 'incominginvoiceitem'
    incoming_invoice_item_id = db.Column(db.Integer, primary_key=True)
    incoming_invoice_id = db.Column(db.Integer, db.ForeignKey('incominginvoice.incoming_invoice_id', ondelete='CASCADE'))
    product_name = db.Column(db.String(100), nullable=False)
    product_description = db.Column(db.Text)
    quantity = db.Column(db.Numeric(10, 3), nullable=False)
    unit_of_measure = db.Column(db.String(20), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    vat_percentage = db.Column(db.Numeric(5, 2), nullable=False)
    vat_amount = db.Column(db.Numeric(10, 2), nullable=False)
    account_number = db.Column(db.String(20))
    invoice = db.relationship('IncomingInvoice', back_populates='items')

class Customer(db.Model):
    __tablename__ = 'customer'
    customer_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    contact_info = db.Column(db.String(255))
    address = db.Column(db.Text)

class OutgoingInvoice(db.Model):
    __tablename__ = 'outgoinginvoice'
    outgoing_invoice_id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(50), unique=True, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.organization_id'), nullable=False)
    storage_id = db.Column(db.Integer, db.ForeignKey('storage.storage_id'), nullable=False)
    responsible_person_id = db.Column(db.Integer, db.ForeignKey('employee.employee_id'), nullable=False)
    contract_number = db.Column(db.String(50))
    payment_document = db.Column(db.String(255))
    comment = db.Column(db.Text)
    items = db.relationship('OutgoingInvoiceItem', back_populates='invoice', cascade="all, delete-orphan")

class OutgoingInvoiceItem(db.Model):
    __tablename__ = 'outgoinginvoiceitem'
    outgoing_invoice_item_id = db.Column(db.Integer, primary_key=True)
    outgoing_invoice_id = db.Column(db.Integer, db.ForeignKey('outgoinginvoice.outgoing_invoice_id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), nullable=False)
    quantity = db.Column(db.Numeric(10, 3), nullable=False)
    unit_of_measure = db.Column(db.String(20), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    vat_percentage = db.Column(db.Numeric(5, 2), nullable=False)
    vat_amount = db.Column(db.Numeric(10, 2), nullable=False)
    discount = db.Column(db.Numeric(10, 2), default=0)
    account_number = db.Column(db.String(20))
    invoice = db.relationship('OutgoingInvoice', back_populates='items')

class Inventory(db.Model):
    __tablename__ = 'inventory'
    inventory_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'))
    quantity = db.Column(db.Numeric(10, 3), nullable=False)
    purchase_date = db.Column(db.DateTime, nullable=False)
    purchase_price = db.Column(db.Numeric(10, 2), nullable=False)





