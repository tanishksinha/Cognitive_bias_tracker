"""add completed_at to user_profiles

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-11
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "user_profiles",
        sa.Column("completed_at", sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_column("user_profiles", "completed_at")
