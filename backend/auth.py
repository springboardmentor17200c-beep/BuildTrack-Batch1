from datetime import datetime, timedelta, timezone
from typing import Annotated
import secrets

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from config import settings

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
OTP_EXPIRATION_MINUTES = settings.otp_expiration_minutes

FAKE_USER_DB = {
    "demo": {
        "username": "demo",
        "password": "secret123",
        "full_name": "Demo User",
        "email": "demo@example.com",
        "phone_number": "+15550000001",
    }
}

FAKE_OTP_STORE: dict[str, dict] = {}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def create_access_token(username: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": username, "exp": expires_at}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user(username: str) -> dict | None:
    return FAKE_USER_DB.get(username)


def get_user_by_email(email: str) -> dict | None:
    for user in FAKE_USER_DB.values():
        if user.get("email") == email:
            return user
    return None


def authenticate_user(username: str, password: str) -> dict | None:
    user = get_user(username)
    if not user:
        return None
    if user["password"] != password:
        return None
    return user


def generate_otp_code() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(6))


def store_otp_for_email(email: str, otp_code: str) -> None:
    FAKE_OTP_STORE[email] = {
        "otp_code": otp_code,
        "expires_at": datetime.now(timezone.utc)
        + timedelta(minutes=OTP_EXPIRATION_MINUTES),
        "verification_token": None,
        "token_expires_at": None,
    }


def send_otp_via_email(email: str, otp_code: str) -> None:
    # Attempt to send an email via SendGrid if configured; otherwise fall back to console.
    api_key = settings.sendgrid_api_key
    from_email = settings.mail_from_email

    if api_key and from_email:
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail

            message = Mail(
                from_email=from_email,
                to_emails=email,
                subject="[BuildTrack] Your OTP",
                plain_text_content=f"Your OTP is {otp_code}",
            )
            sg = SendGridAPIClient(api_key)
            resp = sg.send(message)
            print(f"[SendGrid] Sent OTP to {email}: status={resp.status_code}")
            return
        except Exception as exc:
            print("[SendGrid] Email send failed.")
            print(f"[SendGrid] Error type: {type(exc).__name__}")
            print(f"[SendGrid] Error details: {exc}")
            print("[SendGrid] Falling back to console output.")
    else:
        print("[SendGrid] Missing SendGrid configuration in environment variables.")
        print("Expected: SENDGRID_API_KEY and MAIL_FROM_EMAIL")

    # Fallback / simulation
    print(f"[Email simulation] To {email}: Your OTP is {otp_code}")


def verify_email_otp(email: str, otp_code: str) -> str:
    record = FAKE_OTP_STORE.get(email)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OTP not found for this email",
        )

    if datetime.now(timezone.utc) > record["expires_at"]:
        clear_otp_data(email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired",
        )

    if record["otp_code"] != otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code",
        )

    verification_token = secrets.token_urlsafe(32)
    record["verification_token"] = verification_token
    record["token_expires_at"] = datetime.now(timezone.utc) + timedelta(
        minutes=OTP_EXPIRATION_MINUTES
    )
    return verification_token


def verify_password_reset_token(email: str, verification_token: str) -> None:
    record = FAKE_OTP_STORE.get(email)
    if not record or record.get("verification_token") != verification_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verification token",
        )

    if (
        record.get("token_expires_at") is None
        or datetime.now(timezone.utc) > record["token_expires_at"]
    ):
        clear_otp_data(phone_number)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Verification token has expired",
        )


def clear_otp_data(key: str) -> None:
    FAKE_OTP_STORE.pop(key, None)


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError as exc:
        raise credentials_exception from exc

    user = get_user(username)
    if user is None:
        raise credentials_exception

    return user
