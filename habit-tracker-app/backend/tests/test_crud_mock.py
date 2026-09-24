from datetime import date
from unittest.mock import Mock

from sqlalchemy.orm import Session

from app import crud, models


def test_checkin_existente_no_vuelve_a_escribir_en_la_base():
    # Arrange: un doble de la sesión que "ya tiene" el check-in de ese día
    ya_existente = models.HabitLog(habit_id=1, date=date(2026, 8, 18))
    db = Mock(spec=Session)
    db.query.return_value.filter.return_value.first.return_value = ya_existente

    # Act
    resultado = crud.checkin(db, habit_id=1, on=date(2026, 8, 18))

    # Assert: devuelve el que ya estaba y NO escribe nada
    assert resultado is ya_existente
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_crear_habito_lo_agrega_y_confirma_una_sola_vez():
    # Arrange
    db = Mock(spec=Session)

    # Act
    habito = crud.create_habit(db, name="Leer", description=None)

    # Assert: mira la INTERACCIÓN con la sesión, no un valor
    db.add.assert_called_once_with(habito)
    db.commit.assert_called_once()