import os
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI

from .database import Base, engine
from .routers.habits import router as habits_router

# Si SENTRY_DSN no esta en el entorno (en mi maquina, en los tests, en QA),
# sentry_sdk.init queda apagado y la app sigue andando igual.
sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN", ""),
    traces_sample_rate=1.0,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Rachas API", lifespan=lifespan)


@app.api_route("/api/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}


# Temporal, solo para el TP9: generar un error real para verlo llegar a
# Sentry. Se saca despues de usarlo (ver decisiones.md).
@app.get("/api/falla")
def falla():
    raise RuntimeError("Falla de prueba del TP9")


app.include_router(habits_router)
