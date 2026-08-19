# Rachas (Habit Tracker) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working habit-tracker app (FastAPI backend + React frontend + PostgreSQL) that runs locally, with CRUD for habits, daily check-ins, and current/best streak calculation.

**Architecture:** FastAPI exposes a REST API under `/api/habits...` backed by SQLAlchemy models in PostgreSQL; streak math lives in a small pure-function module so it's cheap to unit test. React (Vite) talks to the API via relative `/api/...` paths, proxied to the backend in dev — the same pattern the student's future nginx config will use, so no CORS and no rewrite needed later.

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy 2.x, Pydantic v2, pytest, psycopg2 — React 18, Vite 5, react-router-dom v6.

**Spec:** `docs/superpowers/specs/2026-08-18-habit-tracker-design.md`

## Global Constraints

- No Dockerfiles, `.dockerignore`, `docker-compose*.yml`, `nginx.conf`, or registry publishing in this plan — those are the student's own TP2 work, explicitly out of scope.
- No authentication — single implicit user.
- All backend API routes live under the `/api` prefix (`/api/health`, `/api/habits`, ...) so the student's future nginx `proxy_pass` (no trailing slash, no rewrite — per their course guide) forwards requests unchanged.
- `DATABASE_URL` is read from an environment variable, defaulting to `postgresql://postgres:postgres@localhost:5432/habits` for local dev.
- Backend logic gets pytest coverage as part of TDD (it's cheap and the streak math is easy to get subtly wrong). Automated frontend tests are explicitly out of scope — verified manually in the browser instead — per the spec, which reserves formal test-suite work for the course's TP5.
- Root `README.md` is reserved for the TP2 deliverable — do not modify it. Dev-run instructions go in `backend/README.md` and `frontend/README.md` instead.

---

### Task 1: Backend project setup & DB models

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/__init__.py`
- Create: `backend/app/database.py`
- Create: `backend/app/models.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`
- Test: `backend/tests/test_models.py`

**Interfaces:**
- Produces: `app.database.Base` (declarative base), `app.database.engine`, `app.database.SessionLocal`, `app.database.get_db()` (generator dependency), `app.models.Habit` (`id`, `name`, `description`, `created_at`, `logs`), `app.models.HabitLog` (`id`, `habit_id`, `date`, `created_at`, unique on `(habit_id, date)`). `tests/conftest.py` fixtures `db_engine` and `db_session` (in-memory SQLite, tables created).

- [ ] **Step 1: Create `backend/requirements.txt`**

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
psycopg2-binary==2.9.9
pydantic==2.9.2
pytest==8.3.3
httpx==0.27.2
```

- [ ] **Step 2: Set up a virtualenv and install dependencies**

Run (from `backend/`):
```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Expected: install completes with no errors.

- [ ] **Step 3: Create `backend/app/__init__.py`** (empty file)

- [ ] **Step 4: Create `backend/app/database.py`**

```python
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/habits"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 5: Create `backend/app/models.py`**

```python
from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from .database import Base


class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")


class HabitLog(Base):
    __tablename__ = "habit_logs"
    __table_args__ = (UniqueConstraint("habit_id", "date", name="uq_habit_log_date"),)

    id = Column(Integer, primary_key=True)
    habit_id = Column(Integer, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    habit = relationship("Habit", back_populates="logs")
```

- [ ] **Step 6: Create `backend/tests/__init__.py`** (empty file)

- [ ] **Step 7: Create `backend/tests/conftest.py`**

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base


@pytest.fixture()
def db_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(db_engine):
    TestingSessionLocal = sessionmaker(bind=db_engine, autoflush=False, autocommit=False)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
```

Tests use in-memory SQLite instead of a real Postgres — the models don't
use any Postgres-specific SQL, so this keeps the suite fast and
independent of a running database.

- [ ] **Step 8: Write the failing test — `backend/tests/test_models.py`**

```python
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
```

- [ ] **Step 9: Run the tests to verify they pass**

Run (from `backend/`, with venv active): `python -m pytest tests/test_models.py -v`
Expected: 2 passed.

- [ ] **Step 10: Commit**

```bash
git add backend/requirements.txt backend/app/__init__.py backend/app/database.py backend/app/models.py backend/tests/__init__.py backend/tests/conftest.py backend/tests/test_models.py
git commit -m "feat(backend): add DB models and SQLite test fixtures"
```

---

### Task 2: Streak calculation logic

**Files:**
- Create: `backend/app/streaks.py`
- Test: `backend/tests/test_streaks.py`

**Interfaces:**
- Consumes: nothing (pure functions, no DB).
- Produces: `app.streaks.current_streak(log_dates: Iterable[date], today: date) -> int`, `app.streaks.best_streak(log_dates: Iterable[date]) -> int`.

- [ ] **Step 1: Write the failing tests — `backend/tests/test_streaks.py`**

```python
from datetime import date

from app.streaks import best_streak, current_streak


def test_current_streak_empty_logs_is_zero():
    assert current_streak([], today=date(2026, 8, 18)) == 0


def test_current_streak_counts_consecutive_days_including_today():
    logs = [date(2026, 8, 18), date(2026, 8, 17), date(2026, 8, 16)]
    assert current_streak(logs, today=date(2026, 8, 18)) == 3


def test_current_streak_still_active_if_yesterday_checked_but_not_today():
    logs = [date(2026, 8, 17), date(2026, 8, 16)]
    assert current_streak(logs, today=date(2026, 8, 18)) == 2


def test_current_streak_breaks_on_gap():
    logs = [date(2026, 8, 18), date(2026, 8, 17), date(2026, 8, 14)]
    assert current_streak(logs, today=date(2026, 8, 18)) == 2


def test_current_streak_zero_if_most_recent_older_than_yesterday():
    logs = [date(2026, 8, 15), date(2026, 8, 14)]
    assert current_streak(logs, today=date(2026, 8, 18)) == 0


def test_best_streak_empty_logs_is_zero():
    assert best_streak([]) == 0


def test_best_streak_finds_longest_run_even_if_not_current():
    logs = [
        date(2026, 8, 1), date(2026, 8, 2), date(2026, 8, 3), date(2026, 8, 4),
        date(2026, 8, 10), date(2026, 8, 11),
    ]
    assert best_streak(logs) == 4


def test_best_streak_ignores_duplicate_dates():
    logs = [date(2026, 8, 1), date(2026, 8, 1), date(2026, 8, 2)]
    assert best_streak(logs) == 2
```

- [ ] **Step 2: Run the tests to verify they fail**

Run (from `backend/`): `python -m pytest tests/test_streaks.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.streaks'`.

- [ ] **Step 3: Create `backend/app/streaks.py`**

```python
from datetime import date, timedelta
from typing import Iterable


def current_streak(log_dates: Iterable[date], today: date) -> int:
    dates = sorted(set(log_dates), reverse=True)
    if not dates:
        return 0

    most_recent = dates[0]
    if most_recent == today:
        cursor = today
    elif most_recent == today - timedelta(days=1):
        cursor = most_recent
    else:
        return 0

    streak = 0
    expected = cursor
    for d in dates:
        if d == expected:
            streak += 1
            expected = expected - timedelta(days=1)
        elif d < expected:
            break
    return streak


def best_streak(log_dates: Iterable[date]) -> int:
    dates = sorted(set(log_dates))
    if not dates:
        return 0

    longest = 1
    current = 1
    for prev, curr in zip(dates, dates[1:]):
        if curr == prev + timedelta(days=1):
            current += 1
            longest = max(longest, current)
        else:
            current = 1
    return longest
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tests/test_streaks.py -v`
Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/app/streaks.py backend/tests/test_streaks.py
git commit -m "feat(backend): add streak calculation logic"
```

---

### Task 3: CRUD data-access layer

**Files:**
- Create: `backend/app/crud.py`
- Test: `backend/tests/test_crud.py`

**Interfaces:**
- Consumes: `app.models.Habit`, `app.models.HabitLog` (Task 1); `app.streaks.current_streak`, `app.streaks.best_streak` (Task 2).
- Produces: `create_habit(db, name, description) -> Habit`, `get_habit(db, habit_id) -> Habit | None`, `list_habits(db) -> list[Habit]`, `update_habit(db, habit, name, description) -> Habit`, `delete_habit(db, habit) -> None`, `checkin(db, habit_id, on: date) -> HabitLog`, `delete_checkin(db, habit_id, on: date) -> bool`, `get_log_dates(db, habit_id) -> list[date]`, `habit_streaks(db, habit_id, today: date) -> tuple[int, int, bool]` (current, best, checked_in_today).

- [ ] **Step 1: Write the failing tests — `backend/tests/test_crud.py`**

```python
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tests/test_crud.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.crud'`.

- [ ] **Step 3: Create `backend/app/crud.py`**

```python
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
    rows = db.query(models.HabitLog.date).filter(models.HabitLog.habit_id == habit_id).all()
    return [row[0] for row in rows]


def habit_streaks(db: Session, habit_id: int, today: date) -> tuple[int, int, bool]:
    dates = get_log_dates(db, habit_id)
    return current_streak(dates, today), best_streak(dates), today in dates
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tests/test_crud.py -v`
Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/app/crud.py backend/tests/test_crud.py
git commit -m "feat(backend): add CRUD data-access layer"
```

---

### Task 4: Pydantic schemas

**Files:**
- Create: `backend/app/schemas.py`
- Test: `backend/tests/test_schemas.py`

**Interfaces:**
- Consumes: nothing (validation layer, independent of DB).
- Produces: `HabitCreate(name, description)`, `HabitUpdate(name, description)`, `HabitOut(id, name, description, created_at, current_streak, best_streak, checked_in_today)`, `HabitLogOut(date)` — all `pydantic.BaseModel` subclasses in `app.schemas`.

- [ ] **Step 1: Write the failing tests — `backend/tests/test_schemas.py`**

```python
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tests/test_schemas.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.schemas'`.

- [ ] **Step 3: Create `backend/app/schemas.py`**

```python
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)


class HabitUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)


class HabitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    created_at: datetime
    current_streak: int
    best_streak: int
    checked_in_today: bool


class HabitLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: date
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tests/test_schemas.py -v`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/app/schemas.py backend/tests/test_schemas.py
git commit -m "feat(backend): add Pydantic schemas"
```

---

### Task 5: FastAPI routers + app wiring

**Files:**
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/routers/habits.py`
- Create: `backend/app/main.py`
- Modify: `backend/tests/conftest.py` (add `client` fixture)
- Test: `backend/tests/test_habits_router.py`

**Interfaces:**
- Consumes: `app.crud.*` (Task 3), `app.schemas.*` (Task 4), `app.database.get_db` (Task 1).
- Produces: `app.main.app` (the FastAPI instance), HTTP API: `GET/POST /api/habits`, `PUT/DELETE /api/habits/{id}`, `POST/DELETE /api/habits/{id}/checkin`, `GET /api/habits/{id}/logs`, `GET /api/health`.

- [ ] **Step 1: Create `backend/app/routers/__init__.py`** (empty file)

- [ ] **Step 2: Create `backend/app/routers/habits.py`**

```python
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
```

- [ ] **Step 3: Create `backend/app/main.py`**

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .database import Base, engine
from .routers.habits import router as habits_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Rachas API", lifespan=lifespan)


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(habits_router)
```

> Note: `lifespan` creates tables using the module-level `engine`
> (Postgres by default). In tests this must be monkeypatched to the
> SQLite test engine, or the test suite would try to open a real
> Postgres connection — that's exactly what the `client` fixture below
> does.

- [ ] **Step 4: Modify `backend/tests/conftest.py`** — replace its entire contents with:

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db


@pytest.fixture()
def db_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(db_engine):
    TestingSessionLocal = sessionmaker(bind=db_engine, autoflush=False, autocommit=False)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_engine, db_session, monkeypatch):
    import app.main as main_module

    monkeypatch.setattr(main_module, "engine", db_engine)

    def override_get_db():
        yield db_session

    main_module.app.dependency_overrides[get_db] = override_get_db
    with TestClient(main_module.app) as test_client:
        yield test_client
    main_module.app.dependency_overrides.clear()
```

- [ ] **Step 5: Write the failing tests — `backend/tests/test_habits_router.py`**

```python
from datetime import date


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_list_habit(client):
    create_response = client.post(
        "/api/habits", json={"name": "Tomar agua", "description": "8 vasos"}
    )
    assert create_response.status_code == 201
    body = create_response.json()
    assert body["name"] == "Tomar agua"
    assert body["current_streak"] == 0
    assert body["checked_in_today"] is False

    list_response = client.get("/api/habits")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


def test_checkin_marks_today_and_updates_streak(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]

    response = client.post(f"/api/habits/{habit_id}/checkin")
    assert response.status_code == 200
    body = response.json()
    assert body["checked_in_today"] is True
    assert body["current_streak"] == 1


def test_checkin_is_idempotent_via_api(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    client.post(f"/api/habits/{habit_id}/checkin")
    response = client.post(f"/api/habits/{habit_id}/checkin")
    assert response.status_code == 200
    assert response.json()["current_streak"] == 1


def test_delete_checkin_undoes_today(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    client.post(f"/api/habits/{habit_id}/checkin")

    response = client.delete(f"/api/habits/{habit_id}/checkin")
    assert response.status_code == 200
    assert response.json()["checked_in_today"] is False
    assert response.json()["current_streak"] == 0


def test_get_logs_returns_dates_desc(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    client.post(f"/api/habits/{habit_id}/checkin")

    response = client.get(f"/api/habits/{habit_id}/logs")
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) == 1
    assert logs[0]["date"] == date.today().isoformat()


def test_update_habit_changes_name(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    response = client.put(
        f"/api/habits/{habit_id}", json={"name": "Leer libros", "description": None}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Leer libros"


def test_delete_habit_removes_it(client):
    habit_id = client.post("/api/habits", json={"name": "Leer"}).json()["id"]
    delete_response = client.delete(f"/api/habits/{habit_id}")
    assert delete_response.status_code == 204

    list_response = client.get("/api/habits")
    assert list_response.json() == []


def test_operations_on_missing_habit_return_404(client):
    assert client.get("/api/habits/999/logs").status_code == 404
    assert client.put("/api/habits/999", json={"name": "X"}).status_code == 404
    assert client.delete("/api/habits/999").status_code == 404
    assert client.post("/api/habits/999/checkin").status_code == 404
```

- [ ] **Step 6: Run the full backend test suite**

Run (from `backend/`): `python -m pytest -v`
Expected: all tests pass (models, streaks, crud, schemas, router — ~27 tests total), and none of them require a running Postgres.

- [ ] **Step 7: Commit**

```bash
git add backend/app/routers backend/app/main.py backend/tests/conftest.py backend/tests/test_habits_router.py
git commit -m "feat(backend): add FastAPI routers and app wiring"
```

---

### Task 6: Backend dev README + manual smoke test against real Postgres

**Files:**
- Create: `backend/README.md`

**Interfaces:**
- Consumes: `app.main.app` (Task 5), a running Postgres instance.
- Produces: a documented, manually-verified way to run the backend against a real database.

- [ ] **Step 1: Create `backend/README.md`**

```markdown
# Rachas — backend

API de FastAPI para el rastreador de hábitos. Esto es solo para
desarrollo local; los Dockerfiles y el compose son parte del TP2 y no
viven en esta carpeta todavía.

## Requisitos

- Python 3.11+
- Un PostgreSQL accesible en `localhost:5432` (podés levantarlo con
  Docker, ver abajo, o instalarlo local)

## Cómo correr en desarrollo

    # 1. Postgres de desarrollo (contenedor ad-hoc, no es el compose del TP2)
    docker run -d --name habits-db -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=habits -p 5432:5432 postgres:16-alpine

    # 2. Backend
    python -m venv venv
    source venv/bin/activate   # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/habits  # Windows: $env:DATABASE_URL = "..."
    uvicorn app.main:app --reload --port 8000

## Verificar que anda

    curl -s http://localhost:8000/api/health
    # {"status":"ok"}

## Tests

    python -m pytest -v
```

- [ ] **Step 2: Start the dev Postgres container**

Run:
```bash
docker run -d --name habits-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=habits -p 5432:5432 postgres:16-alpine
```
Expected: `docker ps` shows `habits-db` running.

- [ ] **Step 3: Run the backend against the real database**

Run (from `backend/`, venv active):
```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/habits
uvicorn app.main:app --reload --port 8000
```
Expected: server starts, logs show it's listening on port 8000, no connection errors.

- [ ] **Step 4: Manually verify the API end-to-end**

Run in another terminal:
```bash
curl -s http://localhost:8000/api/health
curl -s -X POST http://localhost:8000/api/habits -H "Content-Type: application/json" -d '{"name":"Tomar agua"}'
curl -s http://localhost:8000/api/habits
```
Expected: `/api/health` returns `{"status":"ok"}`; the POST returns the created habit with `current_streak: 0`; the GET lists it.

- [ ] **Step 5: Commit**

```bash
git add backend/README.md
git commit -m "docs(backend): add local dev instructions"
```

---

### Task 7: Frontend scaffolding

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/styles.css`
- Create: `frontend/src/api/habits.js`
- Create: `frontend/src/pages/DashboardPage.jsx` (stub)
- Create: `frontend/src/pages/HabitDetailPage.jsx` (stub)

**Interfaces:**
- Consumes: the backend's `/api/habits...` endpoints (Task 5), reached in dev via the Vite proxy.
- Produces: `api/habits.js` exports `listHabits()`, `createHabit(data)`, `updateHabit(id, data)`, `deleteHabit(id)`, `checkin(id)`, `deleteCheckin(id)`, `getLogs(id)` — all returning parsed JSON promises, used by Task 8 and Task 9.

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "rachas-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.8"
  }
}
```

- [ ] **Step 2: Create `frontend/vite.config.js`**

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 3: Create `frontend/index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rachas</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `frontend/src/api/habits.js`**

```js
const BASE_URL = "/api/habits";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function listHabits() {
  return request("");
}

export function createHabit(data) {
  return request("", { method: "POST", body: JSON.stringify(data) });
}

export function updateHabit(id, data) {
  return request(`/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteHabit(id) {
  return request(`/${id}`, { method: "DELETE" });
}

export function checkin(id) {
  return request(`/${id}/checkin`, { method: "POST" });
}

export function deleteCheckin(id) {
  return request(`/${id}/checkin`, { method: "DELETE" });
}

export function getLogs(id) {
  return request(`/${id}/logs`);
}
```

- [ ] **Step 5: Create stub pages — `frontend/src/pages/DashboardPage.jsx`**

```jsx
export default function DashboardPage() {
  return <h1>Rachas</h1>;
}
```

- [ ] **Step 6: Create stub page — `frontend/src/pages/HabitDetailPage.jsx`**

```jsx
export default function HabitDetailPage() {
  return <h1>Detalle del hábito</h1>;
}
```

- [ ] **Step 7: Create `frontend/src/App.jsx`**

```jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import HabitDetailPage from "./pages/HabitDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/habits/:id" element={<HabitDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 8: Create `frontend/src/main.jsx`**

```jsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 9: Create `frontend/src/styles.css`**

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f6f5f3;
  color: #1f2933;
}

.app-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.habit-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.habit-card__name {
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  color: inherit;
}

.habit-card__description {
  margin: 4px 0;
  color: #52606d;
  font-size: 0.9rem;
}

.habit-card__actions {
  display: flex;
  gap: 8px;
}

.streak-badge {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 0.85rem;
  color: #52606d;
}

.btn {
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background: #2f855a;
  color: white;
}

.btn-secondary {
  background: #e4e7eb;
  color: #1f2933;
}

.btn-danger {
  background: #fde8e8;
  color: #c53030;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 320px;
}

.modal form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.log-list {
  list-style: none;
  padding: 0;
}

.log-list li {
  padding: 6px 0;
  border-bottom: 1px solid #e4e7eb;
}

.error {
  color: #c53030;
}
```

- [ ] **Step 10: Install dependencies and start the dev server**

Run (from `frontend/`):
```bash
npm install
npm run dev
```
Expected: Vite prints a local URL (`http://localhost:5173`).

- [ ] **Step 11: Manually verify the scaffold in the browser**

Open `http://localhost:5173`. Expected: page shows "Rachas" heading, no console errors. Navigate to `http://localhost:5173/habits/1`. Expected: page shows "Detalle del hábito" heading.

- [ ] **Step 12: Commit**

```bash
git add frontend/package.json frontend/vite.config.js frontend/index.html frontend/src
git commit -m "feat(frontend): scaffold Vite/React app with routing and API client"
```

---

### Task 8: Dashboard page (list, create, check-in, delete)

**Files:**
- Create: `frontend/src/components/StreakBadge.jsx`
- Create: `frontend/src/components/HabitCard.jsx`
- Create: `frontend/src/components/HabitFormModal.jsx`
- Modify: `frontend/src/pages/DashboardPage.jsx` (replace stub)

**Interfaces:**
- Consumes: `api/habits.js` (`listHabits`, `createHabit`, `checkin`, `deleteCheckin`, `deleteHabit` from Task 7).
- Produces: a working dashboard that later tasks link to (`HabitCard` link target `/habits/:id`, consumed by Task 9's routing — already wired in Task 7's `App.jsx`).

- [ ] **Step 1: Create `frontend/src/components/StreakBadge.jsx`**

```jsx
export default function StreakBadge({ current, best }) {
  return (
    <div className="streak-badge">
      <span>🔥 {current} días</span>
      <span>Mejor: {best}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/HabitCard.jsx`**

```jsx
import { Link } from "react-router-dom";

import StreakBadge from "./StreakBadge";

export default function HabitCard({ habit, onCheckin, onUncheckin, onDelete }) {
  return (
    <div className="habit-card">
      <div>
        <Link to={`/habits/${habit.id}`} className="habit-card__name">
          {habit.name}
        </Link>
        {habit.description && (
          <p className="habit-card__description">{habit.description}</p>
        )}
        <StreakBadge current={habit.current_streak} best={habit.best_streak} />
      </div>
      <div className="habit-card__actions">
        <button
          className={habit.checked_in_today ? "btn btn-secondary" : "btn btn-primary"}
          onClick={() =>
            habit.checked_in_today ? onUncheckin(habit.id) : onCheckin(habit.id)
          }
        >
          {habit.checked_in_today ? "Deshacer hoy" : "Marcar hoy"}
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(habit.id)}>
          Borrar
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/src/components/HabitFormModal.jsx`**

```jsx
import { useState } from "react";

export default function HabitFormModal({ onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ name, description: description || null });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2>Nuevo hábito</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
            />
          </label>
          <label>
            Descripción (opcional)
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
            />
          </label>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Replace `frontend/src/pages/DashboardPage.jsx`**

```jsx
import { useEffect, useState } from "react";

import * as habitsApi from "../api/habits";
import HabitCard from "../components/HabitCard";
import HabitFormModal from "../components/HabitFormModal";

export default function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    setLoading(true);
    try {
      const data = await habitsApi.listHabits();
      setHabits(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(values) {
    await habitsApi.createHabit(values);
    setShowForm(false);
    await loadHabits();
  }

  async function handleCheckin(id) {
    await habitsApi.checkin(id);
    await loadHabits();
  }

  async function handleUncheckin(id) {
    await habitsApi.deleteCheckin(id);
    await loadHabits();
  }

  async function handleDelete(id) {
    await habitsApi.deleteHabit(id);
    await loadHabits();
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Rachas</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo hábito
        </button>
      </header>

      {loading && <p>Cargando...</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="habit-list">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onCheckin={handleCheckin}
            onUncheckin={handleUncheckin}
            onDelete={handleDelete}
          />
        ))}
        {!loading && habits.length === 0 && <p>Todavía no creaste ningún hábito.</p>}
      </div>

      {showForm && (
        <HabitFormModal onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Manually verify in the browser**

With the backend running (Task 6) and `npm run dev` running, open `http://localhost:5173`:
1. Click "+ Nuevo hábito", fill in a name, submit. Expected: modal closes, the habit appears in the list with "🔥 0 días".
2. Click "Marcar hoy". Expected: button changes to "Deshacer hoy", badge updates to "🔥 1 días".
3. Click "Deshacer hoy". Expected: reverts to "Marcar hoy", "🔥 0 días".
4. Click "Borrar". Expected: the habit disappears from the list.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components frontend/src/pages/DashboardPage.jsx
git commit -m "feat(frontend): implement dashboard with create/checkin/delete"
```

---

### Task 9: Habit detail page (history + best streak)

**Files:**
- Modify: `frontend/src/pages/HabitDetailPage.jsx` (replace stub)

**Interfaces:**
- Consumes: `api/habits.js` (`listHabits`, `getLogs` from Task 7).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Replace `frontend/src/pages/HabitDetailPage.jsx`**

```jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import * as habitsApi from "../api/habits";

export default function HabitDetailPage() {
  const { id } = useParams();
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const habits = await habitsApi.listHabits();
      setHabit(habits.find((h) => String(h.id) === id) ?? null);
      setLogs(await habitsApi.getLogs(id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="error">Error: {error}</p>;
  if (!habit) return <p>Cargando...</p>;

  return (
    <div className="app-container">
      <Link to="/">&larr; Volver</Link>
      <h1>{habit.name}</h1>
      {habit.description && <p>{habit.description}</p>}
      <p>
        Racha actual: <strong>{habit.current_streak} días</strong> — Mejor racha:{" "}
        <strong>{habit.best_streak} días</strong>
      </p>
      <h2>Historial</h2>
      <ul className="log-list">
        {logs.map((log) => (
          <li key={log.date}>{log.date}</li>
        ))}
        {logs.length === 0 && <li>Sin check-ins todavía.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

With backend and frontend running:
1. From the dashboard, click a habit's name. Expected: navigates to `/habits/<id>`, shows the habit's name, description, current/best streak, and a history list.
2. Click "← Volver". Expected: returns to the dashboard.
3. Check in on the dashboard, revisit the detail page. Expected: today's date appears in the history list and the streak numbers match the dashboard.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HabitDetailPage.jsx
git commit -m "feat(frontend): implement habit detail page with history"
```

---

### Task 10: Frontend dev README + full end-to-end verification

**Files:**
- Create: `frontend/README.md`

**Interfaces:**
- Consumes: the whole app (Tasks 1–9).
- Produces: documented, manually-verified local dev flow for backend + frontend + DB together.

- [ ] **Step 1: Create `frontend/README.md`**

```markdown
# Rachas — frontend

App de React + Vite para el rastreador de hábitos. Esto es solo para
desarrollo local; el Dockerfile y el nginx.conf son parte del TP2 y no
viven en esta carpeta todavía.

## Requisitos

- Node 20+
- El backend corriendo en `http://localhost:8000` (ver `../backend/README.md`)

## Cómo correr en desarrollo

    npm install
    npm run dev

Abre `http://localhost:5173`. Las llamadas a `/api/...` se redirigen al
backend vía el proxy configurado en `vite.config.js` — no hace falta
CORS en desarrollo.
```

- [ ] **Step 2: Full end-to-end manual verification**

With `habits-db` (Task 6) running, backend running (`uvicorn app.main:app --reload --port 8000`), and frontend running (`npm run dev`):
1. Create 2–3 habits from the dashboard.
2. Check in on one of them, verify the streak badge updates.
3. Refresh the browser page. Expected: habits and check-in state persist (backed by Postgres, not component state).
4. Stop and restart the backend process (`Ctrl-C`, then `uvicorn ...` again). Expected: after restart, `GET /api/habits` (and the dashboard) still show the same habits — data lives in the `habits-db` container, not in the backend process.
5. Open a habit's detail page and confirm the history list matches what you checked in.

- [ ] **Step 3: Commit**

```bash
git add frontend/README.md
git commit -m "docs(frontend): add local dev instructions"
```

---

## After this plan

The app runs locally end-to-end. Dockerfiles, `.dockerignore` files,
`docker-compose.yml`, `docker-compose.registry.yml`, `nginx.conf`,
`.env.example`, registry publishing, `decisiones.md`, `evidencias.md`,
and the top-level `README.md` are the student's own TP2 work, built on
top of this `backend/` and `frontend/` code.
