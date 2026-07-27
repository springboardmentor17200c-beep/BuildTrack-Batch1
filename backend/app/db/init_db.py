from app.db.database import Base, engine

# Import all models before creating tables
from app.models import *

def init_db():
    Base.metadata.create_all(bind=engine)