from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:1234@localhost:5432/buildtrack_db', connect_args={'options': '-csearch_path=buildtrack,public'})
with engine.connect() as conn:
    conn.execute(text("UPDATE inventory SET available_quantity = available_quantity + 500 FROM materials WHERE inventory.material_id = materials.material_id AND LOWER(materials.material_name) = 'sand'"))
    conn.commit()
