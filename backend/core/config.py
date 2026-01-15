from pydantic_settings import BaseSettings
from typing import Optional
import os
import secrets


class Settings(BaseSettings):
    PROJECT_NAME: str = "RMG ERP System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # PostgreSQL Base Settings - Use environment variables, fallback to defaults for development only
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "root")  # Must be set in production via env
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")

    # Multi-Database Host Configuration
    POSTGRES_HOST_CLIENTS: str = "db-clients"
    POSTGRES_HOST_SAMPLES: str = "db-samples"
    POSTGRES_HOST_USERS: str = "db-users"
    POSTGRES_HOST_ORDERS: str = "db-orders"
    POSTGRES_HOST_MERCHANDISER: str = "db-merchandiser"
    POSTGRES_HOST_SETTINGS: str = "db-settings"

    # Multi-Database Names
    POSTGRES_DB_CLIENTS: str = "rmg_erp_clients"
    POSTGRES_DB_SAMPLES: str = "rmg_erp_samples"
    POSTGRES_DB_USERS: str = "rmg_erp_users"
    POSTGRES_DB_ORDERS: str = "rmg_erp_orders"
    POSTGRES_DB_MERCHANDISER: str = "rmg_erp_merchandiser"
    POSTGRES_DB_SETTINGS: str = "rmg_erp_settings"

    # Legacy single DB (for backward compatibility)
    POSTGRES_HOST: str = "db-samples"
    POSTGRES_DB: str = "rmg_erp_samples"

    # Computed Database URLs
    DATABASE_URL: Optional[str] = None
    DATABASE_URL_CLIENTS: Optional[str] = None
    DATABASE_URL_SAMPLES: Optional[str] = None
    DATABASE_URL_USERS: Optional[str] = None
    DATABASE_URL_ORDERS: Optional[str] = None
    DATABASE_URL_MERCHANDISER: Optional[str] = None
    DATABASE_URL_SETTINGS: Optional[str] = None

    # JWT Settings - SECRET_KEY must be set via environment variable in production
    # Generate a secure key: python -c "import secrets; print(secrets.token_urlsafe(32))"
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        secrets.token_urlsafe(32) if os.getenv("ENVIRONMENT") != "development" else "dev-secret-key-change-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days default

    # Redis Cache
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # Database Connection Pool Settings
    POOL_SIZE: int = 10
    MAX_OVERFLOW: int = 10

    # CORS - Configure via environment variable
    # In production, set CORS_ORIGINS to comma-separated list: "https://app.example.com,https://admin.example.com"
    # In development, defaults to allow all for local development
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> list:
        """Parse CORS origins from environment variable"""
        if self.CORS_ORIGINS == "*":
            return ["*"] if self.ENVIRONMENT == "development" else []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"  # Ignore extra environment variables

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Build database URLs for each database
        self.DATABASE_URL_CLIENTS = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_CLIENTS}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_CLIENTS}"
        self.DATABASE_URL_SAMPLES = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_SAMPLES}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_SAMPLES}"
        self.DATABASE_URL_USERS = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_USERS}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_USERS}"
        self.DATABASE_URL_ORDERS = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_ORDERS}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_ORDERS}"
        self.DATABASE_URL_MERCHANDISER = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_MERCHANDISER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_MERCHANDISER}"
        self.DATABASE_URL_SETTINGS = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST_SETTINGS}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_SETTINGS}"

        # Legacy DATABASE_URL defaults to samples
        if not self.DATABASE_URL:
            self.DATABASE_URL = self.DATABASE_URL_SAMPLES


settings = Settings()
