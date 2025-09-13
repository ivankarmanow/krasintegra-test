FROM python:3.11-slim AS builder

ENV POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1 \
    POETRY_HOME="/opt/poetry"

RUN pip install --no-cache-dir poetry

WORKDIR /app

COPY pyproject.toml poetry.lock ./

RUN poetry install --no-root

FROM python:3.11-slim AS runtime

WORKDIR /app

COPY --from=builder /usr/local /usr/local
COPY --from=builder /usr/bin /usr/bin

COPY src ./src
COPY migrations ./migrations
COPY alembic.ini ./
COPY .env ./
RUN mkdir -p ./upload

ENV PYTHONUNBUFFERED=1

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "src.testovoe:create_app()", "--bind", "0.0.0.0:8012"]
