from sqlalchemy import text, create_engine
from app.db.database import Base, engine, DATABASE_URL
import app.models

def ensure_database_exists():
    try:
        with engine.connect() as conn:
            pass
    except Exception as e:
        err_msg = str(e)
        if "does not exist" in err_msg or "3D000" in err_msg:
            default_url = DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
            db_name = DATABASE_URL.rsplit('/', 1)[1]
            temp_engine = create_engine(default_url, isolation_level="AUTOCOMMIT")
            with temp_engine.connect() as conn:
                conn.execute(text(f'CREATE DATABASE "{db_name}";'))
            temp_engine.dispose()
        else:
            raise e

def init_db():
    ensure_database_exists()
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS buildtrack;"))
        conn.commit()
    Base.metadata.create_all(bind=engine)