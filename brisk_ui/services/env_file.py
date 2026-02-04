"""Service for reading and writing .env files."""

import pathlib


class EnvFileService:
    """Service for managing the .brisk/.env file."""

    def __init__(self, project_path: pathlib.Path):
        self.env_path = project_path / ".brisk" / ".env"

    def read(self) -> dict[str, str]:
        """Read the .env file and return as a dictionary.
        
        Returns an empty dict if file doesn't exist.
        """
        if not self.env_path.exists():
            return {}

        data = {}
        with open(self.env_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, value = line.split("=", 1)
                    data[key.strip()] = value.strip()
        return data

    def write(self, data: dict[str, str]) -> None:
        """Write dictionary to .env file.
        
        Creates the file if it doesn't exist.
        """
        # Ensure directory exists
        self.env_path.parent.mkdir(parents=True, exist_ok=True)

        with open(self.env_path, "w") as f:
            for key, value in data.items():
                f.write(f"{key}={value}\n")
