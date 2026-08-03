from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"

    otp_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    otp_hash = Column(String(255), nullable=False)

    expires_at = Column(DateTime, nullable=False)

    used = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User")