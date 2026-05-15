from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.dependencies import get_db, get_current_user
from app.models.decision import Decision
from app.models.option import Option
from app.models.factor import Factor
from app.models.option_ratings import OptionRating

router = APIRouter(prefix="/api/ratings")


@router.post("/")
def submit_rating(
    data: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Accepts a rating by option_index + factor_index and resolves them
    to real option_id / factor_id. This avoids the frontend having to
    track factor IDs (which are not returned at decision creation time).
    """
    decision_id   = data["decision_id"]
    option_index  = data["option_index"]
    factor_index  = data["factor_index"]
    rating        = int(data["rating"])

    if not (1 <= rating <= 10):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 10")

    # Ownership check
    decision = db.query(Decision).filter(
        Decision.decision_id == decision_id,
        Decision.user_id == user.user_id,
    ).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    # Resolve index → ID
    options = db.query(Option).filter_by(decision_id=decision_id)\
                .order_by(Option.position).all()
    factors = db.query(Factor).filter_by(decision_id=decision_id).order_by(Factor.factor_id).all()

    if option_index >= len(options) or factor_index >= len(factors):
        raise HTTPException(status_code=400, detail="Invalid option or factor index")

    option_id = options[option_index].option_id
    factor_id = factors[factor_index].factor_id

    # Upsert — replace if already exists
    existing = db.query(OptionRating).filter_by(
        option_id=option_id, factor_id=factor_id
    ).first()
    if existing:
        existing.rating = rating
    else:
        db.add(OptionRating(option_id=option_id, factor_id=factor_id, rating=rating))

    db.commit()
    return {"status": "ok"}

@router.post("/batch")
def submit_ratings_batch(
    data: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    decision_id = data.get("decision_id")
    ratings_payload = data.get("ratings", [])

    # Ownership check
    decision = db.query(Decision).filter(
        Decision.decision_id == decision_id,
        Decision.user_id == user.user_id,
    ).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    factors = db.query(Factor).filter_by(decision_id=decision_id).order_by(Factor.factor_id).all()

    for r in ratings_payload:
        option_id = r["option_id"]
        factor_index = r["factor_index"]
        rating = r["rating"]

        if not (1 <= rating <= 10):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 10")

        if factor_index >= len(factors):
            raise HTTPException(status_code=400, detail="Invalid factor index")

        factor_id = factors[factor_index].factor_id

        existing = db.query(OptionRating).filter_by(
            option_id=option_id, factor_id=factor_id
        ).first()
        if existing:
            existing.rating = rating
        else:
            db.add(OptionRating(option_id=option_id, factor_id=factor_id, rating=rating))

    db.commit()
    return {"status": "ok"}
