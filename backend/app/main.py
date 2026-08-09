from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, company, project, project_milestone, report
from app.db.init_db import init_db

app = FastAPI(
    title="BuildTrack API",
    description="Construction Project Management & Site Monitoring Platform",
    version="1.0.0",
)

@app.on_event("startup")
def on_startup():
    try:
        init_db()
        print("Database schema and tables initialized successfully!")
    except Exception as e:
        print(f"Failed to connect or initialize PostgreSQL database: {e}")

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
app.include_router(company.router)
app.include_router(project.router)
app.include_router(project_milestone.router)
app.include_router(report.router)