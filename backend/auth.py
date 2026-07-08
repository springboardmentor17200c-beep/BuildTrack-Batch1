from datetime import datetime, timedelta, timezone
from typing import Annotated
import secrets
import os

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
OTP_EXPIRATION_MINUTES = 5

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


def get_user_by_phone(phone_number: str) -> dict | None:
    for user in FAKE_USER_DB.values():
        if user.get("phone_number") == phone_number:
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


def store_otp_for_phone(phone_number: str, otp_code: str) -> None:
    FAKE_OTP_STORE[phone_number] = {
        "otp_code": otp_code,
        "expires_at": datetime.now(timezone.utc)
        + timedelta(minutes=OTP_EXPIRATION_MINUTES),
        "verification_token": None,
        "token_expires_at": None,
    }


def send_otp_to_phone(phone_number: str, otp_code: str) -> None:
    # Attempt to send via Twilio if credentials are provided; otherwise fall back to console.
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")

    if account_sid and auth_token and from_number:
        try:
            from twilio.rest import Client

            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=f"[BuildTrack] Your OTP is {otp_code}",
                from_=from_number,
                to=phone_number,
            )
            print(f"[Twilio] Sent message SID {message.sid} to {phone_number}")
            return
        except Exception as exc:
            print(
                f"[Twilio] Failed to send SMS: {exc}. Falling back to console output."
            )

    # Fallback / simulation
    print(f"[SMS simulation via Twilio to {phone_number}]: Your OTP is {otp_code}")


def verify_phone_otp(phone_number: str, otp_code: str) -> str:
    record = FAKE_OTP_STORE.get(phone_number)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OTP not found for this phone number",
        )

    if datetime.now(timezone.utc) > record["expires_at"]:
        clear_otp_data(phone_number)
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


def verify_password_reset_token(phone_number: str, verification_token: str) -> None:
    record = FAKE_OTP_STORE.get(phone_number)
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


def clear_otp_data(phone_number: str) -> None:
    FAKE_OTP_STORE.pop(phone_number, None)


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
