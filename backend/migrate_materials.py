from app.db.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Rename unit_of_measure -> unit to match model
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema='buildtrack' AND table_name='materials' AND column_name='unit_of_measure'"
    ))
    if result.fetchone():
        conn.execute(text("ALTER TABLE buildtrack.materials RENAME COLUMN unit_of_measure TO unit"))
        print("Renamed unit_of_measure -> unit")
    else:
        print("unit_of_measure column not found (already renamed or doesn't exist)")

    # Add company_id if missing
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema='buildtrack' AND table_name='materials' AND column_name='company_id'"
    ))
    if not result.fetchone():
        conn.execute(text(
            "ALTER TABLE buildtrack.materials ADD COLUMN company_id INTEGER "
            "REFERENCES buildtrack.companies(company_id)"
        ))
        print("Added company_id column")
    else:
        print("company_id already exists")

    # Add is_active if missing
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema='buildtrack' AND table_name='materials' AND column_name='is_active'"
    ))
    if not result.fetchone():
        conn.execute(text(
            "ALTER TABLE buildtrack.materials ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE"
        ))
        print("Added is_active column")
    else:
        print("is_active already exists")

    # Add created_at if missing
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema='buildtrack' AND table_name='materials' AND column_name='created_at'"
    ))
    if not result.fetchone():
        conn.execute(text(
            "ALTER TABLE buildtrack.materials ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()"
        ))
        print("Added created_at column")
    else:
        print("created_at already exists")

    # Add updated_at if missing
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema='buildtrack' AND table_name='materials' AND column_name='updated_at'"
    ))
    if not result.fetchone():
        conn.execute(text(
            "ALTER TABLE buildtrack.materials ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW()"
        ))
        print("Added updated_at column")
    else:
        print("updated_at already exists")

    conn.commit()
    print("\nMigration complete.")
