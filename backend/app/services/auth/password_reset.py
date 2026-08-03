from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_password_reset_token,
    decode_password_reset_token,
    hash_password,
    verify_password,
)
from app.models.password_reset_otp import PasswordResetOTP
from app.models.user import User
from app.schemas.auth import (
    RequestOtpRequest,
    VerifyOtpRequest,
    VerifyOtpResponse,
    ResetPasswordRequest,
)
from app.utils.mail import send_password_reset_otp
from app.utils.otp import generate_otp


OTP_EXPIRY_MINUTES = 10


def request_otp(
    payload: RequestOtpRequest,
    db: Session,
):
    user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    # Don't reveal whether the email exists.
    if user is None:
        return {
            "success": True,
            "message": "If an account exists, an OTP has been sent.",
        }

    # Invalidate previous unused OTPs.
    (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user.user_id,
            PasswordResetOTP.used == False,
        )
        .update({"used": True})
    )

    otp = generate_otp()

    otp_record = PasswordResetOTP(
        user_id=user.user_id,
        otp_hash=hash_password(otp),
        expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=OTP_EXPIRY_MINUTES),
    )

    db.add(otp_record)
    db.commit()

    send_password_reset_otp(
        user.email,
        otp,
    )

    return {
        "success": True,
        "message": "If an account exists, an OTP has been sent.",
    }


def verify_otp(
    payload: VerifyOtpRequest,
    db: Session,
):
    user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    otp_record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user.user_id,
            PasswordResetOTP.used == False,
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )

    if otp_record is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found.",
        )

    if otp_record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired.",
        )

    if not verify_password(
        payload.otp,
        otp_record.otp_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    otp_record.used = True
    db.commit()

    token = create_password_reset_token(user.user_id)

    return VerifyOtpResponse(
        verification_token=token,
    )


def reset_password(
    payload: ResetPasswordRequest,
    db: Session,
):
    token_data = decode_password_reset_token(
        payload.verification_token
    )

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired verification token.",
        )

    user = (
        db.query(User)
        .filter(User.user_id == token_data["user_id"])
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.password_hash = hash_password(
        payload.new_password
    )

    db.commit()

    return {
        "success": True,
        "message": "Password reset successful.",
    }