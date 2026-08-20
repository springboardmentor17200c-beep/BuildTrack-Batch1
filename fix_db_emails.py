from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:1234@localhost:5432/buildtrack_db', connect_args={'options': '-csearch_path=buildtrack,public'})
with engine.connect() as conn:
    conn.execute(text("UPDATE users SET email = REPLACE(email, '.local', '.com') WHERE email LIKE '%.local'"))
    conn.commit()
