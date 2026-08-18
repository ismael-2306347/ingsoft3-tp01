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
