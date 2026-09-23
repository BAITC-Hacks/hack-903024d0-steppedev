"""Server-only settings. No secret is returned by any API response."""
from dataclasses import dataclass
from pathlib import Path
import os

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[3]
load_dotenv(ROOT / "backend" / ".env")


def local_path(name: str, default: str) -> Path:
    path = Path(os.environ.get(name) or default).expanduser()
    return (path if path.is_absolute() else ROOT / path).resolve()


@dataclass(frozen=True)
class Settings:
    task_dir: Path = local_path("WINDOPS_TASK_DIR", "task")
    storage_dir: Path = local_path("WINDOPS_STORAGE_DIR", "storage")
    refresh_seconds: int = max(300, int(os.environ.get("WINDOPS_REFRESH_SECONDS") or 3600))
    weather_key: str = os.environ.get("OPEN_METEO_API_KEY", "")
    nvidia_key: str = os.environ.get("NVIDIA_API_KEY", "")
    nvidia_model: str = os.environ.get("NVIDIA_MODEL", "")


settings = Settings()
