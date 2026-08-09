from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, company, project, project_milestone

app = FastAPI(
    title="BuildTrack API",
    description="Construction Project Management & Site Monitoring Platform",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",  # Angular development server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to BuildTrack API",
        "version": "1.0.0",
        "status": "Running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "Healthy",
    }

app.include_router(auth.router)
app.include_router(company.router)
app.include_router(project.router)
app.include_router(project_milestone.router)