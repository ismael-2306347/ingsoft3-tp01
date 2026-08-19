import pytest
from pydantic import ValidationError

from app.schemas import HabitCreate


def test_habit_create_accepts_valid_payload():
    habit = HabitCreate(name="Tomar agua", description="8 vasos")
    assert habit.name == "Tomar agua"


def test_habit_create_allows_missing_description():
    habit = HabitCreate(name="Tomar agua")
    assert habit.description is None


def test_habit_create_rejects_empty_name():
    with pytest.raises(ValidationError):
        HabitCreate(name="")


def test_habit_create_rejects_name_over_100_chars():
    with pytest.raises(ValidationError):
        HabitCreate(name="a" * 101)
