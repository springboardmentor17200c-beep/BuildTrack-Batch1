from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, company, project, project_milestone, vendor, material, inventory, report, analytics, resource, projects_data, inventory_data, workforce_data, notification
from routes.procurement import router as procurement_router
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
app.include_router(vendor.router)
app.include_router(procurement_router)
app.include_router(material.router)
app.include_router(inventory.router)
app.include_router(report.router)
app.include_router(analytics.router)
app.include_router(resource.router)
app.include_router(projects_data.router)
app.include_router(inventory_data.router)
app.include_router(workforce_data.router)
app.include_router(notification.router)


