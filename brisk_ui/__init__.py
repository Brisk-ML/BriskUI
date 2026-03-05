"""brisk-ui: Web GUI for the Brisk ML framework."""

import os
import pathlib
import threading
import webbrowser
import time

import uvicorn


def start_server(
    project_path: pathlib.Path,
    port: int = 8050,
    create_mode: bool = False,
    open_browser: bool = True,
) -> None:
    """Start the brisk-ui server.

    This is the public API called by the brisk CLI. It configures the
    environment, launches uvicorn, and optionally opens the browser.
    The call blocks until the server is stopped (Ctrl+C).

    Parameters
    ----------
    project_path
        Absolute path to the brisk project directory (edit mode) or the
        parent directory where new projects will be created (create mode).
    port
        Port to bind the server to.
    create_mode
        If True, the UI launches into the project creation wizard instead
        of the normal dashboard.
    open_browser
        If True, automatically opens the UI in the default browser.
    """
    os.environ["BRISK_UI_PROJECT_PATH"] = str(project_path)
    os.environ["BRISK_UI_CREATE_MODE"] = "true" if create_mode else "false"
    os.environ["BRISK_UI_DEV_MODE"] = "false"

    if open_browser:
        def _open():
            time.sleep(1.5)
            webbrowser.open(f"http://127.0.0.1:{port}")
        threading.Thread(target=_open, daemon=True).start()

    uvicorn.run(
        "brisk_ui.server:create_app",
        factory=True,
        host="127.0.0.1",
        port=port,
    )
