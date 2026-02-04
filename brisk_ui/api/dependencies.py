from typing import Annotated

import fastapi

from brisk_ui import config
from brisk_ui.services import database


def get_settings(request: fastapi.Request) -> config.Settings:
    """Get application settings."""
    return request.app.state.settings


def get_database_service(
    settings: Annotated[config.Settings, fastapi.Depends(get_settings)]
) -> database.DatabaseService:
    return database.DatabaseService(settings.database_path)


SettingsDep = Annotated[config.Settings, fastapi.Depends(get_settings)]
DatabaseDep = Annotated[
    database.DatabaseService,
    fastapi.Depends(get_database_service)
]
