from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/habits", tags=["habits"])


def _to_habit_out(db: Session, habit, today: date) -> schemas.HabitOut:
    current, best, checked_today = crud.habit_streaks(db, habit.id, today)
    return schemas.HabitOut(
        id=habit.id,
        name=habit.name,
        description=habit.description,
        created_at=habit.created_at,
        current_streak=current,
        best_streak=best,
        checked_in_today=checked_today,
    )


def _get_habit_or_404(db: Session, habit_id: int):
    habit = crud.get_habit(db, habit_id)
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.get("", response_model=list[schemas.HabitOut])
def list_habits(db: Session = Depends(get_db)):
    today = date.today()
    return [_to_habit_out(db, h, today) for h in crud.list_habits(db)]


@router.post("", response_model=schemas.HabitOut, status_code=201)
def create_habit(payload: schemas.HabitCreate, db: Session = Depends(get_db)):
    habit = crud.create_habit(db, name=payload.name, description=payload.description)
    return _to_habit_out(db, habit, date.today())


@router.put("/{habit_id}", response_model=schemas.HabitOut)
def update_habit(habit_id: int, payload: schemas.HabitUpdate, db: Session = Depends(get_db)):
    habit = _get_habit_or_404(db, habit_id)
    habit = crud.update_habit(db, habit, name=payload.name, description=payload.description)
    return _to_habit_out(db, habit, date.today())


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = _get_habit_or_404(db, habit_id)
    crud.delete_habit(db, habit)


@router.post("/{habit_id}/checkin", response_model=schemas.HabitOut)
def checkin(habit_id: int, db: Session = Depends(get_db)):
    habit = _get_habit_or_404(db, habit_id)
    crud.checkin(db, habit_id, date.today())
    return _to_habit_out(db, habit, date.today())


@router.delete("/{habit_id}/checkin", response_model=schemas.HabitOut)
def delete_checkin(habit_id: int, db: Session = Depends(get_db)):
    habit = _get_habit_or_404(db, habit_id)
    crud.delete_checkin(db, habit_id, date.today())
    return _to_habit_out(db, habit, date.today())


@router.get("/{habit_id}/logs", response_model=list[schemas.HabitLogOut])
def get_logs(habit_id: int, db: Session = Depends(get_db)):
    _get_habit_or_404(db, habit_id)
    dates = crud.get_log_dates(db, habit_id)
    return [schemas.HabitLogOut(date=d) for d in sorted(dates, reverse=True)]
