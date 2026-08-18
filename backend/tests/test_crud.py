from datetime import date

from app import crud


def test_create_and_get_habit(db_session):
    habit = crud.create_habit(db_session, name="Tomar agua", description="8 vasos")
    fetched = crud.get_habit(db_session, habit.id)
    assert fetched is not None
    assert fetched.name == "Tomar agua"


def test_list_habits_returns_created_habits_in_order(db_session):
    crud.create_habit(db_session, name="Leer", description=None)
    crud.create_habit(db_session, name="Correr", description=None)
    habits = crud.list_habits(db_session)
    assert [h.name for h in habits] == ["Leer", "Correr"]


def test_update_habit_changes_name_and_description(db_session):
    habit = crud.create_habit(db_session, name="Leer", description=None)
    updated = crud.update_habit(db_session, habit, name="Leer libros", description="30 min")
    assert updated.name == "Leer libros"
    assert updated.description == "30 min"


def test_delete_habit_removes_it_and_its_logs(db_session):
    habit = crud.create_habit(db_session, name="Leer", description=None)
    crud.checkin(db_session, habit.id, date(2026, 8, 18))
    crud.delete_habit(db_session, habit)
    assert crud.get_habit(db_session, habit.id) is None
    assert crud.get_log_dates(db_session, habit.id) == []


def test_checkin_is_idempotent(db_session):
    habit = crud.create_habit(db_session, name="Leer", description=None)
    first = crud.checkin(db_session, habit.id, date(2026, 8, 18))
    second = crud.checkin(db_session, habit.id, date(2026, 8, 18))
    assert first.id == second.id
    assert crud.get_log_dates(db_session, habit.id) == [date(2026, 8, 18)]


def test_delete_checkin_removes_only_that_day(db_session):
    habit = crud.create_habit(db_session, name="Leer", description=None)
    crud.checkin(db_session, habit.id, date(2026, 8, 17))
    crud.checkin(db_session, habit.id, date(2026, 8, 18))
    removed = crud.delete_checkin(db_session, habit.id, date(2026, 8, 18))
    assert removed is True
    assert crud.get_log_dates(db_session, habit.id) == [date(2026, 8, 17)]


def test_delete_checkin_returns_false_when_nothing_to_remove(db_session):
    habit = crud.create_habit(db_session, name="Leer", description=None)
    removed = crud.delete_checkin(db_session, habit.id, date(2026, 8, 18))
    assert removed is False


def test_habit_streaks_combines_current_and_best(db_session):
    habit = crud.create_habit(db_session, name="Leer", description=None)
    crud.checkin(db_session, habit.id, date(2026, 8, 17))
    crud.checkin(db_session, habit.id, date(2026, 8, 18))
    current, best, checked_today = crud.habit_streaks(db_session, habit.id, today=date(2026, 8, 18))
    assert current == 2
    assert best == 2
    assert checked_today is True
