from pydantic import DirectoryPath
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    db_uri: str
    upload_dir: DirectoryPath
    root_username: str
    root_password: str
    nginx_root_path: str
    static_files: str

    model_config = SettingsConfigDict(env_file=".env")
