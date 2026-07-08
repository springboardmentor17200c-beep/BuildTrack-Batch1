from fastapi import FastAPI
from fastapi import Depends
from fastapi import APIRouter

from routes.auth import router as auth_router

app = FastAPI(title="BuildTrack API")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "BuildTrack API is running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


# include auth routes (login, register, users/me)
app.include_router(auth_router)
