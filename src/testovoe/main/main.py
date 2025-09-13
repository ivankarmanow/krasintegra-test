from fastapi import FastAPI

from .routers import init_routers
from .dependencies import get_config


def create_app():
    cfg = get_config()
    if cfg.nginx_proxy_prefix is not None and cfg.nginx_proxy_prefix != "":
        app = FastAPI(root_path="/api")
    else:
        app = FastAPI()
    init_routers(app)
    return app
