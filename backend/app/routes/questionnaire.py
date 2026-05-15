from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.dependencies import get_db, get_current_user
from app.services.questionnaire_scoring import score_questionnaire
from app.models.user_profile import UserProfile
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/profile")

RETEST_INTERVAL_DAYS = 90


@router.post("/questionnaire")
def submit_questionnaire(
    data: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    try:
        scores = score_questionnaire(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    existing = db.query(UserProfile).filter_by(user_id=user.user_id).first()

    # Enforce 90-day retest interval
    if existing and existing.completed_at:
        earliest_retest = existing.completed_at + timedelta(days=RETEST_INTERVAL_DAYS)
        if datetime.utcnow() < earliest_retest:
            days_remaining = (earliest_retest - datetime.utcnow()).days + 1
            raise HTTPException(
                status_code=429,
                detail=(
                    f"Questionnaire can only be retaken after {RETEST_INTERVAL_DAYS} days. "
                    f"{days_remaining} day(s) remaining."
                ),
            )

    if existing:
        for key, val in scores.items():
            setattr(existing, key, val)
        existing.completed_at = datetime.utcnow()
    else:
        db.add(UserProfile(user_id=user.user_id, completed_at=datetime.utcnow(), **scores))

    db.commit()
    return {"message": "Profile saved", "scores": scores}


@router.get("/me")
def get_profile(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    profile = db.query(UserProfile).filter_by(user_id=user.user_id).first()
    if not profile:
        return {"profile": None, "message": "No profile yet — complete the questionnaire first."}
    return {
        "profile": {
            "crt_score": profile.crt_score,
            "bnt_score": profile.bnt_score,
            "nfc_score": profile.nfc_score,
            "aot_score": profile.aot_score,
            "max_score": profile.max_score,
            "completed_at": profile.completed_at,
        }
    }
@router.delete("/me")
def reset_profile(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    profile = db.query(UserProfile).filter_by(user_id=user.user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="No profile found to reset")
    
    db.delete(profile)
    db.commit()
    return {"message": "Profile reset successfully. You can now retake the questionnaire."}
