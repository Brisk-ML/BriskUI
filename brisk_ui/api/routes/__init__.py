import fastapi

from brisk_ui.api.routes.configs import router as configs_router
from brisk_ui.api.routes.health import router as health_router
from brisk_ui.api.routes.project import router as project_router
from brisk_ui.api.routes.test import router as test_router

router = fastapi.APIRouter()

router.include_router(configs_router, prefix="/configs", tags=["configs"])
router.include_router(health_router, tags=["health"])
router.include_router(project_router, prefix="/project", tags=["project"])
router.include_router(test_router, prefix="/test", tags=["test"])
