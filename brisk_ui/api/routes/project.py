"""Project settings API routes.

Reads and writes project configuration from the .brisk/.env file.
"""

import fastapi
import pydantic

from brisk_ui.services.env_file import EnvFileService

router = fastapi.APIRouter()


class ProjectSettings(pydantic.BaseModel):
    """Project settings model."""
    project_name: str = ""
    project_path: str = ""
    project_description: str = ""


class ProjectSettingsUpdate(pydantic.BaseModel):
    """Partial update model for project settings."""
    project_name: str | None = None
    project_path: str | None = None
    project_description: str | None = None


@router.get("", response_model=ProjectSettings)
async def get_project_settings(request: fastapi.Request):
    """Get project settings from .env file."""
    settings = request.app.state.settings
    env_service = EnvFileService(settings.project_path)
    
    env_data = env_service.read()
    
    return ProjectSettings(
        project_name=env_data.get("project-name", ""),
        project_path=env_data.get("project-path", str(settings.project_path)),
        project_description=env_data.get("project-description", ""),
    )


@router.patch("", response_model=ProjectSettings)
async def update_project_settings(
    request: fastapi.Request,
    update: ProjectSettingsUpdate,
):
    """Update project settings in .env file."""
    settings = request.app.state.settings
    env_service = EnvFileService(settings.project_path)
    
    env_data = env_service.read()
    
    # Update only provided fields
    if update.project_name is not None:
        env_data["project-name"] = update.project_name
    if update.project_path is not None:
        env_data["project-path"] = update.project_path
    if update.project_description is not None:
        env_data["project-description"] = update.project_description
    
    env_service.write(env_data)
    
    return ProjectSettings(
        project_name=env_data.get("project-name", ""),
        project_path=env_data.get("project-path", str(settings.project_path)),
        project_description=env_data.get("project-description", ""),
    )
