import base64
import os
import uuid
from typing import Annotated

from fastapi import Depends
from src.testovoe.main.config import Config
from src.testovoe.main.dependencies import get_config


class FileService:
    def __init__(self, config: Annotated[Config, Depends(get_config)]):
        self.base_dir = config.upload_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def save_base64(self, content_b64: str) -> str:
        new_filename = f"{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(self.base_dir, new_filename)

        with open(filepath, "wb") as f:
            f.write(base64.b64decode(content_b64))

        return filepath

    def delete_file(self, path: str) -> None:
        if path and os.path.isfile(path):
            os.remove(path)

    def replace_file(self, new_file: str, old_path: str | None) -> str:
        if old_path:
            self.delete_file(old_path)
        return self.save_base64(new_file)
