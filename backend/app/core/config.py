from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    APP_NAME: str = "Fitness Garage API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/fitness_garage"
    DB_POOL_MIN_SIZE: int = 2
    DB_POOL_MAX_SIZE: int = 10

    # Security & Encryption (Fernet AES-256 key)
    AES_ENCRYPTION_KEY: str = "faWR4_1XilyP5j2xcAj43hKXMVrw8MnVavyaV5QXM1I="

    # Supabase
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: str = "your-supabase-anon-key"
    SUPABASE_SERVICE_KEY: str = "your-supabase-service-role-key"
    SUPABASE_JWT_SECRET: str = ""

    # Google Places API
    GOOGLE_PLACES_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        return [i.strip() for i in v.split(",") if i.strip()] if isinstance(v, str) else v


settings = Settings()
