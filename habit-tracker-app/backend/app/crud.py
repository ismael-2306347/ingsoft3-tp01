from datetime import date

from sqlalchemy.orm import Session

from . import models
from .streaks import best_streak, current_streak


def create_habit(db: Session, name: str, description: str | None) -> models.Habit:
    habit = models.Habit(name=name, description=description)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


def get_habit(db: Session, habit_id: int) -> models.Habit | None:
    return db.query(models.Habit).filter(models.Habit.id == habit_id).first()


def list_habits(db: Session) -> list[models.Habit]:
    return db.query(models.Habit).order_by(models.Habit.id).all()


def update_habit(db: Session, habit: models.Habit, name: str, description: str | None) -> models.Habit:
    habit.name = name
    habit.description = description
    db.commit()
    db.refresh(habit)
    return habit


def delete_habit(db: Session, habit: models.Habit) -> None:
    db.delete(habit)
    db.commit()


def checkin(db: Session, habit_id: int, on: date) -> models.HabitLog:
    existing = (
        db.query(models.HabitLog)
        .filter(models.HabitLog.habit_id == habit_id, models.HabitLog.date == on)
        .first()
    )
    if existing:
        return existing
    log = models.HabitLog(habit_id=habit_id, date=on)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def delete_checkin(db: Session, habit_id: int, on: date) -> bool:
    existing = (
        db.query(models.HabitLog)
        .filter(models.HabitLog.habit_id == habit_id, models.HabitLog.date == on)
        .first()
    )
    if not existing:
        return False
    db.delete(existing)
    db.commit()
    return True


def get_log_dates(db: Session, habit_id: int) -> list[date]:
    rows = (
        db.query(models.HabitLog.date)
        .filter(models.HabitLog.habit_id == habit_id)
        .order_by(models.HabitLog.date.desc())
        .all()
    )
    return [row[0] for row in rows]


def habit_streaks(db: Session, habit_id: int, today: date) -> tuple[int, int, bool]:
    dates = get_log_dates(db, habit_id)
    return current_streak(dates, today), best_streak(dates), today in dates
