from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:1234@localhost:5432/buildtrack_db', connect_args={'options': '-csearch_path=buildtrack,public'})
conn = engine.connect()

tables = ['shifts', 'inventory', 'employee_profiles', 'projects', 'procurement_request_items']
for t in tables:
    cols = conn.execute(text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t}'")).fetchall()
    print(f"\n=== {t} ===")
    for c in cols:
        print(c)

print("\n=== shifts sample ===")
print(conn.execute(text("SELECT * FROM shifts LIMIT 3")).fetchall())

print("\n=== inventory sample ===")
print(conn.execute(text("SELECT * FROM inventory LIMIT 3")).fetchall())

print("\n=== employee_profiles sample ===")
print(conn.execute(text("SELECT * FROM employee_profiles LIMIT 3")).fetchall())

conn.close()
