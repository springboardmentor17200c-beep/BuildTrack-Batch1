from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:1234@localhost:5432/buildtrack_db', connect_args={'options': '-csearch_path=buildtrack,public'})
conn = engine.connect()

print("=== resources columns ===")
try:
    for c in conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'resources'")).fetchall():
        print(c)
    print("\n=== resources sample ===")
    for r in conn.execute(text("SELECT * FROM resources LIMIT 5")).fetchall():
        print(r)
except Exception as e:
    print("Error:", e)

conn.close()
