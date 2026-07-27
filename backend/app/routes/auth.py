import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.models.user import User
from app.models.company import Company
from app.models.role import Role
from app.models.otp_verification import OtpVerification
from app.schemas.auth import (
    RegisterRequest,
    ChangePasswordRequest,
    Token,
    RegistrationRequest,
    UserProfileResponse,
    ForgotPasswordRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
    SuccessResponse,
    OtpVerificationResponse,
    ResetPasswordResponse,
)
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(
    prefix="",
    tags=["Authentication"],
)


def send_otp_via_email(email: str, otp_code: str) -> None:
    api_key = settings.SENDGRID_API_KEY
    from_email = settings.MAIL_FROM_EMAIL

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


def build_user_profile_response(user: User) -> dict:
    names = user.full_name.split(" ", 1)
    first_name = names[0]
    last_name = names[1] if len(names) > 1 else ""
    
    role_name = user.role.role_name if user.role else "Client"
    # Ensure role name matches the frontend expected values:
    if role_name == "Client":
        role_name = "Client / Owner"
        
    company_name = user.company.company_name if user.company else None
    
    return {
        "user_id": user.user_id,
        "username": user.email, # Use email as username
        "email": user.email,
        "first_name": first_name,
        "last_name": last_name,
        "phone_number": user.phone_number,
        "role": role_name,
        "company_name": company_name,
        "tax_id": None,
        "employee_id": None,
        "skills_or_trade": None,
        "assigned_projects": [],
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


@router.post(
    "/register",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegistrationRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    # 1. Resolve Role
    role_map = {
        "Administrator": "Administrator",
        "Project Manager": "Project Manager",
        "Site Engineer": "Site Engineer",
        "Worker": "Worker",
        "Client / Owner": "Client",
        "Contractor": "Client"
    }
    mapped_role_name = role_map.get(payload.role, payload.role)
    db_role = db.query(Role).filter(Role.role_name == mapped_role_name).first()
    if not db_role:
        db_role = db.query(Role).first()
    role_id = db_role.role_id if db_role else 1

    # 2. Resolve Company
    company_id = None
    if payload.company_name:
        company = db.query(Company).filter(Company.company_name == payload.company_name).first()
        if not company:
            import uuid
            company_code = f"COM-{str(uuid.uuid4())[:8].upper()}"
            company = Company(
                company_name=payload.company_name,
                company_code=company_code,
                company_email=f"info-{str(uuid.uuid4())[:8]}@buildtrack.local",
                company_phone=payload.phone_number,
                address="Default Address",
            )
            db.add(company)
            db.commit()
            db.refresh(company)
        company_id = company.company_id
    else:
        first_company = db.query(Company).first()
        if first_company:
            company_id = first_company.company_id
        else:
            company = Company(
                company_name="Default Company",
                company_code="DEF001",
                company_email="default@buildtrack.local",
                company_phone="0000000000",
                address="Default Address",
            )
            db.add(company)
            db.commit()
            db.refresh(company)
            company_id = company.company_id

    # 3. Create User
    full_name = f"{payload.first_name} {payload.last_name}".strip()
    user = User(
        full_name=full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone_number=payload.phone_number,
        company_id=company_id,
        role_id=role_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return build_user_profile_response(user)


@router.post(
    "/login",
    response_model=Token,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    access_token = create_access_token(
        data={
            "user_id": user.user_id,
            "email": user.email,
            "role_id": user.role_id,
        },
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
    )


@router.get(
    "/users/me",
    response_model=UserProfileResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return build_user_profile_response(current_user)


@router.put(
    "/users/me",
    response_model=UserProfileResponse,
)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    if payload.phone_number is not None:
        current_user.phone_number = payload.phone_number

    if payload.profile_image is not None:
        current_user.profile_image = payload.profile_image

    db.commit()
    db.refresh(current_user)

    return build_user_profile_response(current_user)


@router.put("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(
        payload.current_password,
        current_user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    current_user.password_hash = hash_password(
        payload.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully."
    }


@router.post(
    "/forgot-password",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with that email not found",
        )

    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.OTP_EXPIRATION_MINUTES
    )

    otp_record = (
        db.query(OtpVerification)
        .filter(OtpVerification.email == payload.email)
        .first()
    )

    if otp_record:
        otp_record.otp_code = otp_code
        otp_record.expires_at = expires_at
        otp_record.verification_token = None
        otp_record.token_expires_at = None
    else:
        otp_record = OtpVerification(
            email=payload.email,
            otp_code=otp_code,
            expires_at=expires_at,
        )
        db.add(otp_record)

    db.commit()
    send_otp_via_email(payload.email, otp_code)

    return {"message": "OTP sent to the provided email address."}


@router.post(
    "/verify-otp",
    response_model=OtpVerificationResponse,
    status_code=status.HTTP_200_OK,
)
def verify_otp(
    payload: VerifyOtpRequest,
    db: Session = Depends(get_db),
):
    record = (
        db.query(OtpVerification)
        .filter(OtpVerification.email == payload.email)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OTP not found for this email",
        )

    expires_at = (
        record.expires_at.replace(tzinfo=timezone.utc)
        if record.expires_at.tzinfo is None
        else record.expires_at
    )

    if datetime.now(timezone.utc) > expires_at:
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired",
        )

    if record.otp_code != payload.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code",
        )

    verification_token = secrets.token_urlsafe(32)
    record.verification_token = verification_token
    record.token_expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.OTP_EXPIRATION_MINUTES
    )
    db.commit()

    return {"verification_token": verification_token}


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    record = (
        db.query(OtpVerification)
        .filter(
            OtpVerification.email == payload.email,
            OtpVerification.verification_token == payload.verification_token
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verification token",
        )

    token_expires_at = (
        record.token_expires_at.replace(tzinfo=timezone.utc)
        if record.token_expires_at.tzinfo is None
        else record.token_expires_at
    )

    if datetime.now(timezone.utc) > token_expires_at:
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Verification token has expired",
        )

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with that email not found",
        )

    user.password_hash = hash_password(payload.new_password)
    db.delete(record)
    db.commit()

    return {"message": "Password has been reset successfully."}