"""empty message

Revision ID: 41b4993a8f3d
Revises: 5c676591a882
Create Date: 2024-08-16 18:00:32.032928

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '41b4993a8f3d'
down_revision = '5c676591a882'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('operation', schema=None) as batch_op:
        batch_op.alter_column('operation_type',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.String(length=100),
               existing_nullable=False)
        batch_op.drop_constraint('operation_operation_type_key', type_='unique')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('operation', schema=None) as batch_op:
        batch_op.create_unique_constraint('operation_operation_type_key', ['operation_type'])
        batch_op.alter_column('operation_type',
               existing_type=sa.String(length=100),
               type_=sa.VARCHAR(length=50),
               existing_nullable=False)

    # ### end Alembic commands ###
