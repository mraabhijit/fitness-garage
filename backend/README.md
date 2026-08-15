# Fitness Garage Backend API

FastAPI async REST API service for Fitness Garage.

## Quickstart

```bash
# Install dependencies
uv sync

# Run database migrations
uv run python -m db.migrate

# Start local backend dev server
uv run uvicorn app.main:app --reload --port 8000

# Run test suite
uv run pytest
```
