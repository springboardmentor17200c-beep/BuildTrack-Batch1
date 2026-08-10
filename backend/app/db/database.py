from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from urllib.parse import quote_plus, unquote
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def fix_database_url(url: str) -> str:
    if not url or "://" not in url:
        return url
    scheme, rest = url.split("://", 1)
    if "@" in rest:
        last_at = rest.rfind("@")
        auth = rest[:last_at]
        host_db = rest[last_at + 1:]
        if ":" in auth:
            user, password = auth.split(":", 1)
            encoded_pass = quote_plus(unquote(password))
            return f"{scheme}://{user}:{encoded_pass}@{host_db}"
    return url

if DATABASE_URL:
    DATABASE_URL = fix_database_url(DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "options": "-csearch_path=buildtrack"
    }
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()