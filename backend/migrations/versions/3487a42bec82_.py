"""empty message

Revision ID: 3487a42bec82
Revises: 2ab8476611ca
Create Date: 2024-07-21 22:07:33.636187

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3487a42bec82'
down_revision = '2ab8476611ca'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('outgoinginvoice', schema=None) as batch_op:
        batch_op.alter_column('customer_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('organization_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('storage_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('responsible_person_id',
               existing_type=sa.INTEGER(),
               nullable=False)

    with op.batch_alter_table('outgoinginvoiceitem', schema=None) as batch_op:
        batch_op.alter_column('outgoing_invoice_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('product_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.drop_constraint('outgoinginvoiceitem_service_id_fkey', type_='foreignkey')
        batch_op.drop_column('service_id')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('outgoinginvoiceitem', schema=None) as batch_op:
        batch_op.add_column(sa.Column('service_id', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.create_foreign_key('outgoinginvoiceitem_service_id_fkey', 'service', ['service_id'], ['service_id'])
        batch_op.alter_column('product_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('outgoing_invoice_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    with op.batch_alter_table('outgoinginvoice', schema=None) as batch_op:
        batch_op.alter_column('responsible_person_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('storage_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('organization_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('customer_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    # ### end Alembic commands ###