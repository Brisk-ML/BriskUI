"""Service for reading and writing project configuration as JSON."""

import json
import pathlib


class ProjectConfigService:
    """Service for managing the .brisk/project.json file."""

    def __init__(self, project_path: pathlib.Path):
        self.config_path = project_path / ".brisk" / "project.json"

    def read(self) -> dict:
        """Read the project.json file and return as a dictionary.
        
        Returns an empty dict if file doesn't exist.
        """
        if not self.config_path.exists():
            return {}

        with open(self.config_path, "r") as f:
            return json.load(f)

    def write(self, data: dict) -> None:
        """Write dictionary to project.json file.
        
        Creates the file if it doesn't exist.
        """
        # Ensure directory exists
        self.config_path.parent.mkdir(parents=True, exist_ok=True)

        with open(self.config_path, "w") as f:
            json.dump(data, f, indent=2)
