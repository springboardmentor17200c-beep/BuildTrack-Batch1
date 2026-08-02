import secrets
from sqlalchemy.orm import Session
from app.models.company import Company

def generate_company_code(db: Session):
    while True:
        code = f"BT-{secrets.token_hex(3).upper()}"

        exists = (
            db.query(Company)
            .filter(Company.company_code == code)
            .first()
        )

        if not exists:
            return code