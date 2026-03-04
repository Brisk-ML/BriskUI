import os
import pathlib

import fastapi

router = fastapi.APIRouter()


@router.get("/health")
async def health_check(request: fastapi.Request):
    """Health check endpoint"""
    settings = request.app.state.settings
    return {
        "status": "healthy",
        "project_path": str(settings.project_path),
        "database_exists": settings.database_path.exists(),
    }


@router.get("/status")
async def get_status(request: fastapi.Request):
    """Get server status and mode information.
    
    Used by frontend to determine if we're in create mode.
    """
    settings = request.app.state.settings
    create_mode = os.environ.get("BRISK_UI_CREATE_MODE", "false") == "true"
    
    # Check if project is initialized (has project.json file)
    config_file = settings.project_path / ".brisk" / "project.json"
    project_initialized = config_file.exists()
    
    return {
        "project_path": str(settings.project_path),
        "cwd": str(pathlib.Path.cwd()),
        "create_mode": create_mode,
        "project_initialized": project_initialized,
        "database_exists": settings.database_path.exists(),
    }


@router.get("/validate-path")
async def validate_path(path: str):
    """Check if a filesystem path exists and is a directory.
    
    Used by frontend to validate project path input.
    """
    import pathlib
    p = pathlib.Path(path)
    exists = p.exists()
    is_dir = p.is_dir() if exists else False
    return {
        "path": path,
        "exists": exists,
        "is_directory": is_dir,
    }


@router.post("/switch-to-edit-mode")
async def switch_to_edit_mode(request: fastapi.Request, project_path: str):
    """Switch the backend from create mode to edit mode with a new project path.
    
    Updates the environment variable and app state to use the new project path.
    """
    import pathlib
    from brisk_ui import config
    
    new_path = pathlib.Path(project_path)
    if not new_path.exists():
        raise fastapi.HTTPException(
            status_code=400,
            detail=f"Project path does not exist: {project_path}"
        )
    
    # Update environment to disable create mode
    os.environ["BRISK_UI_CREATE_MODE"] = "false"
    
    # Update app state with new settings pointing to the new project
    request.app.state.settings = config.Settings(project_path=new_path)
    
    return {
        "success": True,
        "project_path": str(new_path),
        "create_mode": False,
    }
