from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from app.db.database import Base


class OtpVerification(Base):
    __tablename__ = "otp_verifications"
    __table_args__ = {"schema": "buildtrack"}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    verification_token = Column(String(255), nullable=True)
    token_expires_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )
