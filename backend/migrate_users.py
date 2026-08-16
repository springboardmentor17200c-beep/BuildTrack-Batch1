from app.db.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Add username column if it doesn't exist
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema='buildtrack' AND table_name='users' AND column_name='username'"
    ))
    if not result.fetchone():
        conn.execute(text("ALTER TABLE buildtrack.users ADD COLUMN username VARCHAR(50) UNIQUE"))
        conn.commit()
        print("Added 'username' column to users table.")
    else:
        print("'username' column already exists.")
