"""Initial migration

Revision ID: a4b0f089dc96
Revises: 
Create Date: 2024-07-14 13:58:01.988598

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a4b0f089dc96'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('customer',
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('contact_info', sa.String(length=255), nullable=True),
    sa.Column('address', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('customer_id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('employee',
    sa.Column('employee_id', sa.Integer(), nullable=False),
    sa.Column('first_name', sa.String(length=50), nullable=False),
    sa.Column('last_name', sa.String(length=50), nullable=False),
    sa.Column('position', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('employee_id')
    )
    op.create_table('organization',
    sa.Column('organization_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.PrimaryKeyConstraint('organization_id')
    )
    op.create_table('product',
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('current_stock', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('unit_of_measure', sa.String(length=20), nullable=False),
    sa.PrimaryKeyConstraint('product_id')
    )
    op.create_table('service',
    sa.Column('service_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.PrimaryKeyConstraint('service_id')
    )
    op.create_table('storage',
    sa.Column('storage_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('location', sa.String(length=255), nullable=True),
    sa.Column('capacity', sa.Numeric(), nullable=True),
    sa.PrimaryKeyConstraint('storage_id')
    )
    op.create_table('supplier',
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('contact_info', sa.String(length=255), nullable=True),
    sa.Column('address', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('supplier_id')
    )
    op.create_table('incominginvoice',
    sa.Column('incoming_invoice_id', sa.Integer(), nullable=False),
    sa.Column('number', sa.String(length=50), nullable=False),
    sa.Column('date', sa.DateTime(), nullable=False),
    sa.Column('counter_agent_id', sa.Integer(), nullable=True),
    sa.Column('operation_type', sa.String(length=50), nullable=False),
    sa.Column('organization_id', sa.Integer(), nullable=True),
    sa.Column('storage_id', sa.Integer(), nullable=True),
    sa.Column('contract_number', sa.String(length=50), nullable=True),
    sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('total_vat', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('responsible_person_id', sa.Integer(), nullable=True),
    sa.Column('comment', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['counter_agent_id'], ['supplier.supplier_id'], ),
    sa.ForeignKeyConstraint(['organization_id'], ['organization.organization_id'], ),
    sa.ForeignKeyConstraint(['responsible_person_id'], ['employee.employee_id'], ),
    sa.ForeignKeyConstraint(['storage_id'], ['storage.storage_id'], ),
    sa.PrimaryKeyConstraint('incoming_invoice_id'),
    sa.UniqueConstraint('number')
    )
    op.create_table('inventory',
    sa.Column('inventory_id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=True),
    sa.Column('quantity', sa.Numeric(precision=10, scale=3), nullable=False),
    sa.Column('purchase_date', sa.DateTime(), nullable=False),
    sa.Column('purchase_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.ForeignKeyConstraint(['product_id'], ['product.product_id'], ),
    sa.PrimaryKeyConstraint('inventory_id')
    )
    op.create_table('outgoinginvoice',
    sa.Column('outgoing_invoice_id', sa.Integer(), nullable=False),
    sa.Column('number', sa.String(length=50), nullable=False),
    sa.Column('date', sa.DateTime(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=True),
    sa.Column('organization_id', sa.Integer(), nullable=True),
    sa.Column('storage_id', sa.Integer(), nullable=True),
    sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('total_vat', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('responsible_person_id', sa.Integer(), nullable=True),
    sa.Column('contract_number', sa.String(length=50), nullable=True),
    sa.Column('payment_document', sa.String(length=255), nullable=True),
    sa.Column('comment', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['customer_id'], ['customer.customer_id'], ),
    sa.ForeignKeyConstraint(['organization_id'], ['organization.organization_id'], ),
    sa.ForeignKeyConstraint(['responsible_person_id'], ['employee.employee_id'], ),
    sa.ForeignKeyConstraint(['storage_id'], ['storage.storage_id'], ),
    sa.PrimaryKeyConstraint('outgoing_invoice_id'),
    sa.UniqueConstraint('number')
    )
    op.create_table('incominginvoiceitem',
    sa.Column('incoming_invoice_item_id', sa.Integer(), nullable=False),
    sa.Column('incoming_invoice_id', sa.Integer(), nullable=True),
    sa.Column('product_id', sa.Integer(), nullable=True),
    sa.Column('quantity', sa.Numeric(precision=10, scale=3), nullable=False),
    sa.Column('unit_of_measure', sa.String(length=20), nullable=False),
    sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('total_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('vat_percentage', sa.Numeric(precision=5, scale=2), nullable=False),
    sa.Column('vat_amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('account_number', sa.String(length=20), nullable=True),
    sa.ForeignKeyConstraint(['incoming_invoice_id'], ['incominginvoice.incoming_invoice_id'], ),
    sa.ForeignKeyConstraint(['product_id'], ['product.product_id'], ),
    sa.PrimaryKeyConstraint('incoming_invoice_item_id')
    )
    op.create_table('outgoinginvoiceitem',
    sa.Column('outgoing_invoice_item_id', sa.Integer(), nullable=False),
    sa.Column('outgoing_invoice_id', sa.Integer(), nullable=True),
    sa.Column('product_id', sa.Integer(), nullable=True),
    sa.Column('service_id', sa.Integer(), nullable=True),
    sa.Column('quantity', sa.Numeric(precision=10, scale=3), nullable=False),
    sa.Column('unit_of_measure', sa.String(length=20), nullable=False),
    sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('total_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('vat_percentage', sa.Numeric(precision=5, scale=2), nullable=False),
    sa.Column('vat_amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('discount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('account_number', sa.String(length=20), nullable=True),
    sa.ForeignKeyConstraint(['outgoing_invoice_id'], ['outgoinginvoice.outgoing_invoice_id'], ),
    sa.ForeignKeyConstraint(['product_id'], ['product.product_id'], ),
    sa.ForeignKeyConstraint(['service_id'], ['service.service_id'], ),
    sa.PrimaryKeyConstraint('outgoing_invoice_item_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('outgoinginvoiceitem')
    op.drop_table('incominginvoiceitem')
    op.drop_table('outgoinginvoice')
    op.drop_table('inventory')
    op.drop_table('incominginvoice')
    op.drop_table('supplier')
    op.drop_table('storage')
    op.drop_table('service')
    op.drop_table('product')
    op.drop_table('organization')
    op.drop_table('employee')
    op.drop_table('customer')
    # ### end Alembic commands ###
