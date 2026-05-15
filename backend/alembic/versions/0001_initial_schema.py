"""initial schema

Revision ID: 0001
Revises:
Create Date: 2025-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("user_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("decision_count", sa.Integer, server_default="0"),
        sa.Column("calibration_phase", sa.String(50), server_default="baseline"),
    )

    op.create_table(
        "user_profiles",
        sa.Column("user_id", sa.Integer,
                  sa.ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True),
        sa.Column("crt_score", sa.Float, nullable=True),
        sa.Column("bnt_score", sa.Float, nullable=True),
        sa.Column("nfc_score", sa.Float, nullable=True),
        sa.Column("aot_score", sa.Float, nullable=True),
        sa.Column("max_score", sa.Float, nullable=True),
    )

    op.create_table(
        "decisions",
        sa.Column("decision_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer,
                  sa.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255)),
        sa.Column("description", sa.String(1000)),
        sa.Column("initial_preference_option_id", sa.Integer, nullable=True),
        sa.Column("final_choice_option_id", sa.Integer, nullable=True),
        sa.Column("started_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("submitted_at", sa.DateTime, nullable=True),
    )
    op.create_index("ix_decisions_user_id", "decisions", ["user_id"])

    op.create_table(
        "options",
        sa.Column("option_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("decision_id", sa.Integer,
                  sa.ForeignKey("decisions.decision_id", ondelete="CASCADE"), nullable=False),
        sa.Column("label", sa.String(255)),
        sa.Column("position", sa.Integer),
    )
    op.create_index("ix_options_decision_id", "options", ["decision_id"])

    op.create_table(
        "factors",
        sa.Column("factor_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("decision_id", sa.Integer,
                  sa.ForeignKey("decisions.decision_id", ondelete="CASCADE"), nullable=False),
        sa.Column("label", sa.String(255)),
        sa.Column("weight", sa.Float),
        sa.Column("weight_initial", sa.Float),
    )
    op.create_index("ix_factors_decision_id", "factors", ["decision_id"])

    op.create_table(
        "option_ratings",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("option_id", sa.Integer,
                  sa.ForeignKey("options.option_id", ondelete="CASCADE"), nullable=False),
        sa.Column("factor_id", sa.Integer,
                  sa.ForeignKey("factors.factor_id", ondelete="CASCADE"), nullable=False),
        sa.Column("rating", sa.Integer),
        sa.UniqueConstraint("option_id", "factor_id", name="uq_option_factor"),
    )

    op.create_table(
        "decision_events",
        sa.Column("event_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("decision_id", sa.Integer,
                  sa.ForeignKey("decisions.decision_id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(100)),
        sa.Column("event_payload", sa.JSON),
        sa.Column("occurred_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_events_decision_id", "decision_events", ["decision_id"])

    op.create_table(
        "decision_outcomes",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("decision_id", sa.Integer,
                  sa.ForeignKey("decisions.decision_id", ondelete="CASCADE"),
                  nullable=False, unique=True),
        sa.Column("satisfaction_score", sa.Integer, nullable=True),
        sa.Column("would_decide_same", sa.Boolean, nullable=True),
    )


def downgrade():
    op.drop_table("decision_outcomes")
    op.drop_index("ix_events_decision_id", "decision_events")
    op.drop_table("decision_events")
    op.drop_table("option_ratings")
    op.drop_index("ix_factors_decision_id", "factors")
    op.drop_table("factors")
    op.drop_index("ix_options_decision_id", "options")
    op.drop_table("options")
    op.drop_index("ix_decisions_user_id", "decisions")
    op.drop_table("decisions")
    op.drop_table("user_profiles")
    op.drop_table("users")
