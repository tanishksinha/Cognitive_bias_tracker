from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.dependencies import get_db, get_current_user
from app.models.decision import Decision
from app.models.decision_outcome import DecisionOutcome
from app.models.option import Option
from app.models.factor import Factor
from app.models.option_ratings import OptionRating
from app.models.event import DecisionEvent
from app.models.user_profile import UserProfile
from datetime import datetime
from app.services.bias_engine import run_bias_engine

router = APIRouter(prefix="/api/decisions")


@router.post("/")
def create_decision(
    data: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    decision = Decision(
        user_id=user.user_id,
        title=data["title"],
        description=data.get("description", ""),
        started_at=datetime.utcnow(),
    )
    db.add(decision)
    db.flush()

    for i, opt in enumerate(data.get("options", [])):
        db.add(Option(
            decision_id=decision.decision_id,
            label=opt,
            position=i,
        ))

    for f in data.get("factors", []):
        db.add(Factor(
            decision_id=decision.decision_id,
            label=f["label"],
            weight=f["weight"],
            weight_initial=f["weight"],
        ))

    db.commit()
    db.refresh(decision)

    # Return options with their IDs so the frontend can reference them
    options = db.query(Option).filter_by(decision_id=decision.decision_id).all()
    return {
        "decision_id": decision.decision_id,
        "options": [{"option_id": o.option_id, "label": o.label, "position": o.position}
                    for o in options],
    }


@router.get("/")
def list_decisions(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    decisions = db.query(Decision).filter_by(user_id=user.user_id)\
                  .order_by(Decision.started_at.desc()).all()
    return [
        {
            "decision_id": d.decision_id,
            "title": d.title,
            "started_at": d.started_at,
            "submitted_at": d.submitted_at,
        }
        for d in decisions
    ]


# IMPORTANT: all string-path routes (/insights, etc.) must come BEFORE /{decision_id}
# or FastAPI will try to match the string as an integer and return 422
@router.get("/insights")
def get_insights(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    decisions = db.query(Decision).filter_by(user_id=user.user_id).all()
    submitted = [d for d in decisions if d.submitted_at]
    return {
        "total_decisions": len(submitted),
        "confidence_level": user.calibration_phase,
        "decision_count": user.decision_count,
    }


@router.get("/{decision_id}/draft")
def get_draft(
    decision_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(
        Decision.decision_id == decision_id,
        Decision.user_id == user.user_id,
    ).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    if decision.submitted_at:
        raise HTTPException(status_code=400, detail="Decision already submitted")

    options = db.query(Option).filter_by(decision_id=decision_id)\
                .order_by(Option.position).all()
    factors = db.query(Factor).filter_by(decision_id=decision_id).all()

    return {
        "decision_id": decision.decision_id,
        "title": decision.title,
        "description": decision.description,
        "initial_preference_option_id": decision.initial_preference_option_id,
        "options": [{"option_id": o.option_id, "label": o.label} for o in options],
        "factors": [{"label": f.label, "weight": f.weight} for f in factors],
    }


@router.post("/{decision_id}/submit")
def submit_decision(
    decision_id: int,
    data: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(
        Decision.decision_id == decision_id,
        Decision.user_id == user.user_id,
    ).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    if decision.submitted_at:
        raise HTTPException(status_code=400, detail="Decision already submitted")

    decision.final_choice_option_id = data["final_choice"]
    decision.initial_preference_option_id = data["initial_preference"]
    decision.submitted_at = datetime.utcnow()

    user.decision_count += 1
    if user.decision_count >= 40:
        user.calibration_phase = "established"
    elif user.decision_count >= 15:
        user.calibration_phase = "early"

    options  = db.query(Option).filter_by(decision_id=decision_id).all()
    factors  = db.query(Factor).filter_by(decision_id=decision_id).order_by(Factor.factor_id).all()
    events   = db.query(DecisionEvent).filter_by(decision_id=decision_id)\
                 .order_by(DecisionEvent.occurred_at).all()
    option_ids = [o.option_id for o in options]
    ratings  = db.query(OptionRating).filter(
        OptionRating.option_id.in_(option_ids)
    ).all()
    profile  = db.query(UserProfile).filter_by(user_id=user.user_id).first()

    results  = run_bias_engine(user, profile, decision, options, factors, events, ratings)

    db.commit()
    return {"analysis": results}


@router.post("/{decision_id}/events")
def log_event(
    decision_id: int,
    data: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(
        Decision.decision_id == decision_id,
        Decision.user_id == user.user_id,
    ).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    db.add(DecisionEvent(
        decision_id=decision_id,
        event_type=data["event_type"],
        event_payload=data.get("event_payload", {}),
        occurred_at=datetime.utcnow(),
    ))
    db.commit()
    return {"status": "logged"}


@router.post("/{decision_id}/outcome")
def add_outcome(
    decision_id: int,
    data: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(
        Decision.decision_id == decision_id,
        Decision.user_id == user.user_id,
    ).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    if not decision.submitted_at:
        raise HTTPException(status_code=400, detail="Cannot record outcome on unsubmitted decision")

    existing = db.query(DecisionOutcome).filter_by(decision_id=decision_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Outcome already recorded")

    db.add(DecisionOutcome(
        decision_id=decision_id,
        satisfaction_score=data["satisfaction"],
        would_decide_same=data["repeat"],
    ))
    db.commit()
    return {"message": "Outcome recorded"}


@router.get("/{decision_id}/analysis")
def get_analysis(
    decision_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(
        Decision.decision_id == decision_id,
        Decision.user_id == user.user_id,
    ).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    if not decision.submitted_at:
        raise HTTPException(status_code=400, detail="Decision not yet submitted")

    options    = db.query(Option).filter_by(decision_id=decision_id).all()
    factors    = db.query(Factor).filter_by(decision_id=decision_id).order_by(Factor.factor_id).all()
    events     = db.query(DecisionEvent).filter_by(decision_id=decision_id)\
                   .order_by(DecisionEvent.occurred_at).all()
    option_ids = [o.option_id for o in options]
    ratings    = db.query(OptionRating).filter(
        OptionRating.option_id.in_(option_ids)
    ).all()
    profile    = db.query(UserProfile).filter_by(user_id=user.user_id).first()

    results = run_bias_engine(user, profile, decision, options, factors, events, ratings)
    return {"analysis": results}
