from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    secret_key: str = "super-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    otp_expiration_minutes: int = 5

    # Email / SendGrid settings (used for password reset emails)
    sendgrid_api_key: str = "dummy-key-for-local-dev"
    mail_from_email: str = "noreply@buildtrack.local"


settings = Settings()