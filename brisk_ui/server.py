"""Application factory for FastAPI"""

import contextlib
import pathlib

import fastapi
from fastapi.middleware import cors
from fastapi import staticfiles

from brisk_ui import config
from brisk_ui.api.routes import router as api_router


@contextlib.asynccontextmanager
async def lifespan(app: fastapi.FastAPI):
    """Manage application lifecycle."""
    settings: config.Settings = app.state.settings
    print(f"brisk-ui starting with project: {settings.project_path}")
    yield
    print("brisk-ui shutting down")


def create_app(project_path: pathlib.Path | None = None) -> fastapi.FastAPI:
    """Create the FastAPI application.

    Arguments
    ---------
    project_path: Path, optional
        Path to brisk project. If None, reads from environment.
    """
    if project_path:
        settings = config.Settings(project_path=project_path)
    else:
        settings = config.Settings()

    app = fastapi.FastAPI(
        title="briskUI",
        description="Web interface for Brisk ML framework.",
        version="0.1.0",
        lifespan=lifespan
    )

    app.state.settings = settings

    if settings.dev_mode:
        app.add_middleware(
            cors.CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    app.include_router(api_router, prefix="/api")

    static_dir = pathlib.Path(__file__).parent / "static"
    if static_dir.exists() and any(static_dir.iterdir()):
        app.mount(
            "/",
            staticfiles.StaticFiles(directory=static_dir, html=True),
            name="static"
        )

    return app
