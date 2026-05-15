"""add is_verified to users

Revision ID: 0003
Revises: 0002
Create Date: 2026-05-05
"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("is_verified", sa.Boolean(), server_default="0", nullable=False),
    )


def downgrade():
    op.drop_column("users", "is_verified")
