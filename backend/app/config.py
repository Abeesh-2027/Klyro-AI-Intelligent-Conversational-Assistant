import sys
from functools import lru_cache

from pydantic import Field, ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "production"
    groq_api_key: str = Field(min_length=10)
    groq_model: str = "openai/gpt-oss-120b"
    mongodb_uri: str = Field(min_length=10)
    mongodb_db: str = "klyro"
    supabase_url: str = Field(min_length=10)
    supabase_anon_key: str = Field(min_length=10)
    cors_origins: str = "http://localhost:5173"
    admin_emails: str = ""

    @field_validator("supabase_url")
    @classmethod
    def clean_supabase_url(cls, value: str) -> str:
        value = value.strip().rstrip("/")
        if not value.startswith(("https://", "http://localhost", "http://127.0.0.1")):
            raise ValueError("must start with https://")
        return value

    @field_validator("cors_origins")
    @classmethod
    def no_wildcard_origin(cls, value: str) -> str:
        if "*" in value:
            raise ValueError("wildcard origins are not allowed, list your site URLs instead")
        return value

    @property
    def is_dev(self) -> bool:
        return self.app_env.lower() == "development"

    @property
    def cors_list(self) -> list[str]:
        return [item.strip().rstrip("/") for item in self.cors_origins.split(",") if item.strip()]

    @property
    def admin_list(self) -> set[str]:
        return {item.strip().lower() for item in self.admin_emails.split(",") if item.strip()}


@lru_cache
def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as error:
        lines = [f"  {'.'.join(str(p) for p in e['loc']).upper()}: {e['msg']}" for e in error.errors()]
        sys.exit("Fix these environment variables and start again:\n" + "\n".join(lines))
