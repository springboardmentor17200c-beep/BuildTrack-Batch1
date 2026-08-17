from app.db.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema='buildtrack' AND table_name='reports' AND column_name='report_data'"
    ))
    if not result.fetchone():
        conn.execute(text("ALTER TABLE buildtrack.reports ADD COLUMN report_data JSON"))
        conn.commit()
        print("Added 'report_data' column to reports table.")
    else:
        print("'report_data' column already exists.")
