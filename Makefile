# Makefile
# Fitness Garage — Common Development Commands
#
# Usage:
#   make <target>
#
# Prerequisites: Docker, Node.js 20+, Python 3.12+, uv

.PHONY: help setup install dev dev-backend dev-frontend \
        test test-backend test-backend-cov test-frontend \
        lint lint-backend lint-frontend \
        format format-backend format-frontend \
        migrate migrate-new \
        docker-up docker-down docker-logs docker-build \
        pre-commit-install pre-commit-run \
        clean branch branch-fix ready

# ─────────────────────────────────────────────────────────────
# HELP
# ─────────────────────────────────────────────────────────────
help: ## Show this help message
	@echo ""
	@echo "  Fitness Garage — Development Commands"
	@echo "  ─────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─────────────────────────────────────────────────────────────
# SETUP
# ─────────────────────────────────────────────────────────────
setup: ## Full first-time setup — install all deps and hooks
	@echo "→ Setting up backend..."
	cd backend && uv sync
	@echo "→ Setting up frontend..."
	cd frontend && npm ci
	@echo "→ Installing pre-commit hooks..."
	pip install pre-commit
	pre-commit install
	@echo "→ Creating .env files from examples..."
	@[ -f backend/.env ] || cp backend/.env.example backend/.env && echo "  Created backend/.env"
	@[ -f frontend/.env.local ] || cp frontend/.env.example frontend/.env.local && echo "  Created frontend/.env.local"
	@echo ""
	@echo "✅ Setup complete. Fill in your .env files before running."

install: ## Install dependencies only (no hooks)
	cd backend && uv sync
	cd frontend && npm ci

# ─────────────────────────────────────────────────────────────
# DEVELOPMENT SERVERS
# ─────────────────────────────────────────────────────────────
dev: ## Start both frontend and backend dev servers (run in separate terminals)
	@echo "→ Starting backend on http://localhost:8000"
	@echo "→ Starting frontend on http://localhost:5173"
	@echo "→ Run 'make dev-backend' and 'make dev-frontend' in separate terminals"

dev-backend: ## Start FastAPI backend dev server with hot reload
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start Vite frontend dev server with hot reload
	cd frontend && npm run dev

# ─────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────
migrate: ## Run all pending database migrations
	cd backend && uv run python -m db.migrate

migrate-new: ## Create a new migration file (usage: make migrate-new NAME=add_column_x)
	@[ "${NAME}" ] || ( echo "❌ Usage: make migrate-new NAME=description_of_migration"; exit 1 )
	@NEXT=$$(ls backend/db/migrations/*.sql 2>/dev/null | wc -l | tr -d ' '); \
	PADDED=$$(printf "%03d" $$((NEXT))); \
	FILE="backend/db/migrations/$${PADDED}_${NAME}.sql"; \
	echo "-- Migration: $${PADDED}_${NAME}" > $$FILE; \
	echo "-- Created: $$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $$FILE; \
	echo "" >> $$FILE; \
	echo "-- Write your idempotent SQL here" >> $$FILE; \
	echo "-- Use IF NOT EXISTS, ON CONFLICT DO NOTHING, CREATE OR REPLACE" >> $$FILE; \
	echo "" >> $$FILE; \
	echo "✅ Created: $$FILE"

# ─────────────────────────────────────────────────────────────
# TESTING
# ─────────────────────────────────────────────────────────────
test: test-backend test-frontend ## Run all tests (backend + frontend)

test-backend: ## Run backend pytest suite
	cd backend && uv run pytest tests/ -v --tb=short

test-backend-cov: ## Run backend tests with coverage report
	cd backend && uv run pytest tests/ -v --tb=short \
		--cov=app \
		--cov-report=term-missing \
		--cov-report=html:htmlcov \
		--cov-fail-under=70

test-frontend: ## Run frontend type check and build
	cd frontend && npx tsc --noEmit && npm run build

test-feature: ## Run tests for a specific feature (usage: make test-feature FEATURE=members)
	@[ "${FEATURE}" ] || ( echo "❌ Usage: make test-feature FEATURE=<feature_name>"; exit 1 )
	cd backend && uv run pytest tests/test_${FEATURE}.py -v --tb=long

# ─────────────────────────────────────────────────────────────
# LINTING
# ─────────────────────────────────────────────────────────────
lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## Run backend linters (flake8, mypy, bandit)
	@echo "→ flake8..."
	cd backend && uv run flake8 app/ db/ --max-line-length=100 --extend-ignore=E203,W503 --exclude=db/migrations/
	@echo "→ mypy..."
	cd backend && uv run mypy app/ db/ --ignore-missing-imports --strict --exclude=tests/
	@echo "→ bandit..."
	cd backend && uv run bandit -r app/ db/ --severity-level=medium --confidence-level=medium --exclude=db/migrations/
	@echo "✅ Backend lint passed"

lint-frontend: ## Run frontend linters (eslint, tsc)
	@echo "→ eslint..."
	cd frontend && npx eslint src/ --max-warnings=0
	@echo "→ tsc..."
	cd frontend && npx tsc --noEmit
	@echo "✅ Frontend lint passed"

# ─────────────────────────────────────────────────────────────
# FORMATTING
# ─────────────────────────────────────────────────────────────
format: format-backend format-frontend ## Format all code

format-backend: ## Format backend code (black + isort)
	cd backend && uv run black app/ db/ tests/
	cd backend && uv run isort --profile black app/ db/ tests/
	@echo "✅ Backend formatted"

format-frontend: ## Format frontend code (prettier)
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css}"
	@echo "✅ Frontend formatted"

# ─────────────────────────────────────────────────────────────
# PRE-COMMIT
# ─────────────────────────────────────────────────────────────
pre-commit-install: ## Install pre-commit hooks into git
	pre-commit install
	@echo "✅ Pre-commit hooks installed"

pre-commit-run: ## Run all pre-commit hooks against all files
	pre-commit run --all-files

pre-commit-update: ## Update all pre-commit hook versions
	pre-commit autoupdate

# ─────────────────────────────────────────────────────────────
# DOCKER
# ─────────────────────────────────────────────────────────────
docker-up: ## Start all Docker services (postgres + backend + frontend)
	docker compose up

docker-up-d: ## Start all Docker services in background
	docker compose up -d

docker-up-tools: ## Start all services including pgAdmin
	docker compose --profile tools up -d

docker-down: ## Stop all Docker services
	docker compose down

docker-down-v: ## Stop all services and remove volumes (destroys local DB)
	@echo "⚠️  This will destroy the local database. Are you sure? [y/N]"
	@read -r CONFIRM; [ "$$CONFIRM" = "y" ] && docker compose down -v || echo "Aborted."

docker-build: ## Rebuild all Docker images (use after Dockerfile changes)
	docker compose build --no-cache

docker-logs: ## Tail logs from all services
	docker compose logs -f

docker-logs-backend: ## Tail logs from backend only
	docker compose logs -f backend

docker-logs-frontend: ## Tail logs from frontend only
	docker compose logs -f frontend

docker-shell-backend: ## Open a shell inside the backend container
	docker compose exec backend bash

docker-shell-db: ## Open psql inside the postgres container
	docker compose exec postgres psql -U postgres -d fitness_garage

docker-migrate: ## Run database migrations inside Docker
	docker compose run --rm backend python -m db.migrate

docker-test: ## Run backend test suite inside Docker
	docker compose run --rm backend pytest tests/ -v --tb=short

# ─────────────────────────────────────────────────────────────
# WORKFLOW SHORTCUTS
# ─────────────────────────────────────────────────────────────
branch: ## Create a feature branch (usage: make branch SCOPE=backend NAME=bulk-import)
	@[ "${SCOPE}" ] || ( echo "❌ Usage: make branch SCOPE=<frontend|backend|db|infra|docs> NAME=<description>"; exit 1 )
	@[ "${NAME}" ] || ( echo "❌ Usage: make branch SCOPE=<scope> NAME=<short-description>"; exit 1 )
	git checkout develop
	git pull origin develop
	git checkout -b feature/${SCOPE}/${NAME}
	@echo "✅ Created and switched to: feature/${SCOPE}/${NAME}"

branch-fix: ## Create a fix branch (usage: make branch-fix SCOPE=backend NAME=null-decrypt)
	@[ "${SCOPE}" ] || ( echo "❌ Usage: make branch-fix SCOPE=<scope> NAME=<description>"; exit 1 )
	@[ "${NAME}" ] || ( echo "❌ Usage: make branch-fix SCOPE=<scope> NAME=<description>"; exit 1 )
	git checkout develop
	git pull origin develop
	git checkout -b fix/${SCOPE}/${NAME}
	@echo "✅ Created and switched to: fix/${SCOPE}/${NAME}"

ready: ## Run full pre-PR checklist (lint + test + pre-commit)
	@echo "─────────────────────────────────────────"
	@echo " Running pre-PR checklist..."
	@echo "─────────────────────────────────────────"
	@$(MAKE) lint
	@$(MAKE) test
	@$(MAKE) pre-commit-run
	@echo ""
	@echo "✅ All checks passed — ready to commit and push"

# ─────────────────────────────────────────────────────────────
# CLEAN
# ─────────────────────────────────────────────────────────────
clean: ## Remove all build artifacts and caches
	rm -rf frontend/dist frontend/.vite frontend/node_modules/.cache
	rm -rf backend/.mypy_cache backend/.pytest_cache backend/.ruff_cache
	find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find backend -name "*.pyc" -delete 2>/dev/null || true
	@echo "✅ Clean complete"
