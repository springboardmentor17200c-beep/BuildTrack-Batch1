from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # SendGrid email settings
    SENDGRID_API_KEY: str | None = None
    MAIL_FROM_EMAIL: str | None = None
    OTP_EXPIRATION_MINUTES: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()