"""Entrypoint into the backend. Accepts required configuration values."""

import json
import pathlib

import pydantic_settings
import pydantic


class Settings(pydantic_settings.BaseSettings):
    """Application settings with dev/prod configuration."""
    project_path: pathlib.Path = pydantic.Field(default=pathlib.Path.cwd())

    host: str = "127.0.0.1"
    port: int = 8050

    dev_mode: bool = False
    create_mode: bool = False
    cors_origins: list[str] = pydantic.Field(default_factory=list)

    database_name: str = "brisk.sqlite"

    model_config = pydantic_settings.SettingsConfigDict(
        env_prefix="BRISK_UI_",
    )

    @pydantic.field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from JSON string or list."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v] if v else []
        return v

    @property
    def database_path(self) -> pathlib.Path:
        return self.project_path / ".brisk" / self.database_name


def get_dev_settings(project_path: pathlib.Path | str) -> Settings:
    """Create settings for development."""
    return Settings(
        project_path=pathlib.Path(project_path),
        dev_mode=True,
        cors_origins=["http://localhost:3000"],
    )


def get_prod_settings(project_path: pathlib.Path) -> Settings:
    """Create settings for production."""
    return Settings(
        project_path=project_path,
        dev_mode=False,
    )
