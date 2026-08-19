from datetime import date

import pytest
from sqlalchemy.exc import IntegrityError

from app.models import Habit, HabitLog


def test_create_habit_and_log(db_session):
    habit = Habit(name="Tomar agua", description="8 vasos por dia")
    db_session.add(habit)
    db_session.commit()
    db_session.refresh(habit)

    log = HabitLog(habit_id=habit.id, date=date(2026, 8, 18))
    db_session.add(log)
    db_session.commit()

    assert habit.id is not None
    assert log.id is not None
    assert log.habit_id == habit.id


def test_duplicate_checkin_same_day_violates_unique_constraint(db_session):
    habit = Habit(name="Leer")
    db_session.add(habit)
    db_session.commit()
    db_session.refresh(habit)

    db_session.add(HabitLog(habit_id=habit.id, date=date(2026, 8, 18)))
    db_session.commit()

    db_session.add(HabitLog(habit_id=habit.id, date=date(2026, 8, 18)))
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
