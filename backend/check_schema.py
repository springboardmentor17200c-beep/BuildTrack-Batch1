"""
Compare SQLAlchemy model columns vs actual DB columns for all registered models.
Run from backend/ directory.
"""
import app.models  # register all models
from app.db.database import engine, Base
from sqlalchemy import text, inspect

inspector = inspect(engine)

print("=== Model vs DB column comparison ===\n")
for mapper in Base.registry.mappers:
    cls = mapper.class_
    table_name = cls.__tablename__
    # columns from model
    model_cols = {col.key for col in mapper.columns}
    # columns from actual DB (in buildtrack schema)
    try:
        db_cols = {c['name'] for c in inspector.get_columns(table_name, schema='buildtrack')}
    except Exception:
        db_cols = set()
        print(f"  [MISSING TABLE] {table_name}")
        continue

    missing_in_db = model_cols - db_cols
    extra_in_db   = db_cols - model_cols

    if missing_in_db or extra_in_db:
        print(f"[MISMATCH] {table_name}")
        if missing_in_db:
            print(f"  In model but NOT in DB: {sorted(missing_in_db)}")
        if extra_in_db:
            print(f"  In DB but NOT in model: {sorted(extra_in_db)}")
    else:
        print(f"[OK] {table_name}")
