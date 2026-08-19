from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:1234@localhost:5432/buildtrack_db', connect_args={'options': '-csearch_path=buildtrack,public'})
conn = engine.connect()

print("=== resource_allocations columns ===")
for c in conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'resource_allocations'")).fetchall():
    print(c)

print("\n=== resource_allocations sample ===")
for r in conn.execute(text("SELECT * FROM resource_allocations LIMIT 5")).fetchall():
    print(r)

print("\n=== materials columns ===")
for c in conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'materials'")).fetchall():
    print(c)

print("\n=== materials sample ===")
for r in conn.execute(text("SELECT * FROM materials LIMIT 5")).fetchall():
    print(r)

conn.close()
