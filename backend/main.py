from fastapi import FastAPI
from fastapi import Depends
from fastapi import APIRouter

from routes.auth import router as auth_router
from routes.procurement import router as procurement_router

app = FastAPI(title="BuildTrack API")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root() -> dict[str, str]:
    return {"message": "BuildTrack API is running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


# include routes
app.include_router(auth_router)
app.include_router(procurement_router)
