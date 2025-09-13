from functools import lru_cache

from src.testovoe.main.config import Config


@lru_cache
def get_config() -> Config:
    return Config()
