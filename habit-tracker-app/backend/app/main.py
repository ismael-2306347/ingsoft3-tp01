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
