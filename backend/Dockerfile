# backend/Dockerfile
# Fitness Garage — Backend (FastAPI + uv)
# Used by docker-compose.yml for local development
# Production: Render auto-builds from GitHub using this Dockerfile

FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv using official Astral binary image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files first (layer caching — only reinstall if deps change)
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy application and db source
COPY app/ ./app/
COPY db/ ./db/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start command
# Migrations run first, then the server starts
CMD ["sh", "-c", "uv run python -m db.migrate && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"]
