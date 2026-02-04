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
