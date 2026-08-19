# Rachas — rastreador de hábitos con rachas (diseño)

## Contexto

Repo del semestre para la materia Ingeniería de Software 3. Este documento
diseña **solo la aplicación** (backend + frontend + base de datos,
corriendo local): CRUD de hábitos con cálculo de racha actual y mejor
racha histórica.

**Explícitamente fuera de alcance de este spec** (el usuario los va a
hacer él mismo como parte del TP2 de la materia):

- Dockerfiles (backend y frontend), `.dockerignore`.
- `docker-compose.yml`, `docker-compose.registry.yml`, `nginx.conf`.
- `.env.example` / `.env` "oficiales" del TP2, publicación de imágenes en
  registry.
- `decisiones.md`, `evidencias.md`, `README.md` de entrega del TP2.
- Autenticación / login (single-user por ahora).
- Tests automatizados (corresponden al TP5 de la materia).

El único objetivo de esta implementación es tener la app **funcionando
localmente** (backend nativo con `uvicorn`, frontend nativo con
`npm run dev`, Postgres en un contenedor ad-hoc de desarrollo — no un
deliverable) para que el usuario después la contenerice por su cuenta.

## Modelo de datos

Dos tablas en PostgreSQL:

```
habits
  id            serial PK
  name          varchar(100) not null
  description   text null
  created_at    timestamptz not null default now()

habit_logs
  id            serial PK
  habit_id      int not null FK -> habits.id ON DELETE CASCADE
  date          date not null
  created_at    timestamptz not null default now()
  UNIQUE (habit_id, date)
```

El constraint único evita doble check-in el mismo día. La racha **no se
persiste**: se calcula a partir de `habit_logs` en cada consulta.

### Algoritmo de racha

Dado el conjunto de fechas (`date`) con check-in para un hábito, ordenadas
descendente:

- **`current_streak`**: si la fecha más reciente es *hoy* o *ayer*, contar
  hacia atrás días consecutivos sin huecos desde esa fecha. Si la fecha
  más reciente es anterior a ayer (o no hay logs), `current_streak = 0`.
  (Ese matiz "hoy o ayer" es a propósito: si todavía no hiciste el
  check-in de hoy pero sí el de ayer, la racha sigue viva hasta que
  termine el día.)
- **`best_streak`**: la corrida consecutiva más larga en todo el
  historial de logs (equivalente a "longest run of consecutive dates").

Esta lógica vive en una función pura (fácil de testear a futuro en TP5,
aunque no se testea ahora).

## Backend — FastAPI + SQLAlchemy

Estructura:

```
backend/
  app/
    main.py         # instancia FastAPI, monta el router, /health
    database.py     # engine, SessionLocal, Base, get_db dependency
    models.py       # Habit, HabitLog (SQLAlchemy)
    schemas.py       # Pydantic: HabitCreate, HabitUpdate, HabitOut, HabitLogOut
    streaks.py        # current_streak(dates), best_streak(dates) — funciones puras
    crud.py             # funciones de acceso a datos (create_habit, list_habits, etc.)
    routers/
      habits.py          # endpoints /habits*
  requirements.txt
```

El schema de la BD se crea al arrancar (`Base.metadata.create_all(engine)`
en el startup de `main.py`), sin Alembic por ahora.

`DATABASE_URL` se lee de una variable de entorno (ej.
`postgresql://postgres:postgres@localhost:5432/habits`), con un default
razonable para desarrollo local si no está seteada.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | `{"status": "ok"}` |
| GET | `/habits` | Lista hábitos con `current_streak`, `best_streak`, `checked_in_today` |
| POST | `/habits` | Crea hábito (`name` requerido, `description` opcional) |
| PUT | `/habits/{id}` | Edita nombre/descripción |
| DELETE | `/habits/{id}` | Borra hábito (cascada sobre sus logs) |
| POST | `/habits/{id}/checkin` | Marca hoy como cumplido (idempotente: si ya existe, no falla) |
| DELETE | `/habits/{id}/checkin` | Deshace el check-in de hoy |
| GET | `/habits/{id}/logs` | Historial de fechas cumplidas (para la pantalla de detalle) |

`HabitOut` (respuesta típica de lista/detalle):

```json
{
  "id": 1,
  "name": "Tomar agua",
  "description": "8 vasos por día",
  "created_at": "2026-08-01T10:00:00Z",
  "current_streak": 5,
  "best_streak": 12,
  "checked_in_today": true
}
```

## Frontend — React + Vite

Estructura:

```
frontend/
  src/
    api/habits.js          # fetch wrapper, todas las llamadas a /api/habits...
    pages/
      DashboardPage.jsx     # lista de hábitos + botón "marcar hoy" por hábito
      HabitDetailPage.jsx    # historial de check-ins + best streak de un hábito
    components/
      HabitCard.jsx           # tarjeta de un hábito en el dashboard
      HabitFormModal.jsx        # alta/edición (modal, no página aparte)
      StreakBadge.jsx             # número de racha con estilo
    App.jsx                       # rutas (react-router): "/" y "/habits/:id"
    main.jsx
  vite.config.js                  # proxy "/api" -> "http://localhost:8000"
  package.json
```

3 vistas funcionales: dashboard (lista + alta vía modal), detalle/historial
por hábito. El alta/edición se resuelve con un modal sobre el dashboard en
vez de una página separada — menos navegación, mismo requisito de "2-3
pantallas" que pide la materia.

Estilos: CSS simple, sin librería de UI pesada (mantenemos el foco en
funcionalidad; se puede pulir visualmente después sin tocar la
arquitectura).

## Cómo se corre en desarrollo (no es parte del TP2)

```bash
# 1. Postgres de desarrollo (ad-hoc, no es el compose del TP2)
docker run -d --name habits-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=habits -p 5432:5432 postgres:16-alpine

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate   # o el equivalente en Windows
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/habits
uvicorn app.main:app --reload --port 8000

# 3. Frontend
cd frontend
npm install
npm run dev   # http://localhost:5173, proxea /api a localhost:8000
```

## Fuera de alcance (recordatorio)

Todo lo listado en "Contexto" arriba. Este spec no incluye Dockerfiles,
compose, nginx, ni archivos de entrega del TP2 — esos los escribe el
usuario como parte de su propio trabajo práctico.
