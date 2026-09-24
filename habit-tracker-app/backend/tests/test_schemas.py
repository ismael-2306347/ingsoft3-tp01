import pytest
from pydantic import ValidationError

from app.schemas import HabitCreate


def test_habit_create_accepts_valid_payload():
    habit = HabitCreate(name="Tomar agua", description="8 vasos")
    assert habit.name == "Tomar agua"


def test_habit_create_allows_missing_description():
    habit = HabitCreate(name="Tomar agua")
    assert habit.description is None


@pytest.mark.parametrize(
    "nombre",
    [
        "",           # vacío
        "   ",        # sólo espacios
        "\t",         # un tabulador
        "a" * 101,    # uno más que el máximo
    ],
)
def test_habit_create_rejects_invalid_name(nombre):
    with pytest.raises(ValidationError):
        HabitCreate(name=nombre)


def test_habit_create_accepts_name_of_exactly_100_chars():
    habit = HabitCreate(name="a" * 100)
    assert len(habit.name) == 100


def test_habit_create_trims_surrounding_spaces():
    habit = HabitCreate(name="  Leer  ")
    assert habit.name == "Leer"


def test_habit_create_rejects_description_over_500_chars():
    with pytest.raises(ValidationError) as error:
        HabitCreate(name="Leer", description="a" * 501)
    assert "500" in str(error.value)