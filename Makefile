# Makefile
# Fitness Garage — Development Commands (v2 — Static Frontend Only)
#
# Backend targets removed — no backend in Phase 1.
# Backend Makefile targets documented in docs/ARCHIVED/ for Phase 2.
#
# Usage: make <target>
# Prerequisites: Node.js 20+, npm

.PHONY: help setup install dev lint lint-frontend format format-frontend \
        test test-frontend validate-data sync-reviews \
        docker-up docker-up-d docker-down docker-build docker-logs \
        docker-shell docker-rebuild \
        pre-commit-install pre-commit-run pre-commit-update \
        branch branch-fix ready clean \
        content-check placeholder-check

# ─────────────────────────────────────────────────────────────
# HELP
# ─────────────────────────────────────────────────────────────
help: ## Show this help message
	@echo ""
	@echo "  Fitness Garage — Development Commands (Static Frontend)"
	@echo "  ────────────────────────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-28s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─────────────────────────────────────────────────────────────
# SETUP
# ─────────────────────────────────────────────────────────────
setup: ## First-time setup — install deps and pre-commit hooks
	@echo "→ Installing frontend dependencies..."
	cd frontend && npm ci
	@echo "→ Installing pre-commit..."
	pip install pre-commit
	pre-commit install
	@echo "→ Creating .env.local from example..."
	@[ -f frontend/.env.local ] \
		&& echo "  .env.local already exists — skipping" \
		|| (cp frontend/.env.example frontend/.env.local && echo "  Created frontend/.env.local")
	@echo ""
	@echo "✅ Setup complete."
	@echo "   Fill in VITE_GOOGLE_PLACES_API_KEY and VITE_GOOGLE_PLACE_ID in frontend/.env.local"

install: ## Install frontend dependencies only
	cd frontend && npm ci

# ─────────────────────────────────────────────────────────────
# DEVELOPMENT
# ─────────────────────────────────────────────────────────────
dev: ## Start Vite frontend dev server (http://localhost:5173)
	cd frontend && npm run dev

dev-frontend: dev ## Alias for dev

preview: ## Preview production build locally
	cd frontend && npm run build && npm run preview

# ─────────────────────────────────────────────────────────────
# LINTING & FORMATTING
# ─────────────────────────────────────────────────────────────
lint: lint-frontend ## Run all linters

lint-frontend: ## Run ESLint + tsc type check
	@echo "→ eslint..."
	cd frontend && npx eslint src/ --max-warnings=0
	@echo "→ tsc..."
	cd frontend && npx tsc --noEmit
	@echo "✅ Lint passed"

format: format-frontend ## Format all code

format-frontend: ## Run Prettier on all TypeScript/CSS files
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css}"
	@echo "✅ Formatted"

format-check: ## Check formatting without writing (used in CI)
	cd frontend && npx prettier --check "src/**/*.{ts,tsx,css}"

# ─────────────────────────────────────────────────────────────
# TESTING & VALIDATION
# ─────────────────────────────────────────────────────────────
test: test-frontend validate-data ## Run all checks (type check + build + data validation)

test-frontend: ## TypeScript type check + production build
	@echo "→ Type check..."
	cd frontend && npx tsc --noEmit
	@echo "→ Production build..."
	cd frontend && npm run build
	@echo "✅ Frontend checks passed"

validate-data: ## Validate all src/data/*.json files
	@echo "→ Validating data files..."
	@REQUIRED="site hero services plans trainers gallery achievements reviews"; \
	FAILED=0; \
	for name in $$REQUIRED; do \
		FILE="frontend/src/data/$${name}.json"; \
		if [ ! -f "$$FILE" ]; then \
			echo "  ❌ Missing: $$FILE"; FAILED=1; \
		elif python3 -m json.tool "$$FILE" > /dev/null 2>&1; then \
			echo "  ✅ $$FILE"; \
		else \
			echo "  ❌ Invalid JSON: $$FILE"; FAILED=1; \
		fi; \
	done; \
	if [ $$FAILED -eq 1 ]; then echo "Fix data files and retry."; exit 1; fi
	@python3 -c "\
import json; \
d = json.load(open('frontend/src/data/plans.json')); \
plans = d.get('plans',[]); \
assert len(plans)==8, f'Expected 8 plans, found {len(plans)}'; \
print('  ✅ plans.json — 8 combinations confirmed'); \
"
	@echo "✅ All data files valid"

placeholder-check: ## Warn about remaining placeholder values in data files
	@echo "→ Checking for placeholder values..."
	@FOUND=0; \
	for FILE in frontend/src/data/*.json; do \
		if grep -q "TBD" "$$FILE" 2>/dev/null; then \
			echo "  ⚠️  TBD found in: $$FILE"; FOUND=1; \
		fi; \
	done; \
	if [ $$FOUND -eq 0 ]; then echo "  ✅ No placeholders found"; \
	else echo ""; echo "  Update placeholder values before launch."; fi

# ─────────────────────────────────────────────────────────────
# DOCKER — frontend only
# ─────────────────────────────────────────────────────────────
docker-up: ## Start frontend in Docker (http://localhost:5173)
	docker compose up

docker-up-d: ## Start frontend in Docker (background)
	docker compose up -d
	@echo "→ Frontend running at http://localhost:5173"

docker-down: ## Stop all Docker services
	docker compose down

docker-build: ## Rebuild Docker image (use after Dockerfile changes)
	docker compose build --no-cache

docker-rebuild: docker-build docker-up-d ## Rebuild and restart
	@echo "✅ Rebuilt and started"

docker-logs: ## Tail frontend container logs
	docker compose logs -f frontend

docker-shell: ## Open a shell inside the frontend container
	docker compose exec frontend sh

# ─────────────────────────────────────────────────────────────
# PRE-COMMIT
# ─────────────────────────────────────────────────────────────
pre-commit-install: ## Install pre-commit hooks into git
	pre-commit install
	@echo "✅ Pre-commit hooks installed"

pre-commit-run: ## Run all pre-commit hooks against all files
	pre-commit run --all-files

pre-commit-update: ## Update all hook versions to latest
	pre-commit autoupdate

# ─────────────────────────────────────────────────────────────
# CONTENT MANAGEMENT
# ─────────────────────────────────────────────────────────────
content-check: validate-data placeholder-check ## Full content audit (validation + placeholder check)

sync-reviews: ## Sync up to 20 verified reviews from Google Maps into src/data/reviews.json
	@python3 scripts/sync_reviews.py

# ─────────────────────────────────────────────────────────────
# GIT WORKFLOW SHORTCUTS
# ─────────────────────────────────────────────────────────────
branch: ## Create a feature branch (usage: make branch NAME=hero-slideshow)
	@[ "${NAME}" ] || ( echo "❌ Usage: make branch NAME=<short-description>"; exit 1 )
	git checkout develop
	git pull origin develop
	git checkout -b feature/frontend/${NAME}
	@echo "✅ Created: feature/frontend/${NAME}"

branch-content: ## Create a content update branch (usage: make branch-content NAME=update-pricing)
	@[ "${NAME}" ] || ( echo "❌ Usage: make branch-content NAME=<description>"; exit 1 )
	git checkout develop
	git pull origin develop
	git checkout -b chore/content/${NAME}
	@echo "✅ Created: chore/content/${NAME}"

branch-fix: ## Create a fix branch (usage: make branch-fix NAME=gallery-lightbox-keyboard)
	@[ "${NAME}" ] || ( echo "❌ Usage: make branch-fix NAME=<description>"; exit 1 )
	git checkout develop
	git pull origin develop
	git checkout -b fix/frontend/${NAME}
	@echo "✅ Created: fix/frontend/${NAME}"

ready: ## Full pre-PR checklist — lint + test + data validation + pre-commit
	@echo "─────────────────────────────────────────────────"
	@echo " Running pre-PR checklist..."
	@echo "─────────────────────────────────────────────────"
	@$(MAKE) format-check
	@$(MAKE) lint-frontend
	@$(MAKE) test-frontend
	@$(MAKE) validate-data
	@$(MAKE) pre-commit-run
	@echo ""
	@echo "✅ All checks passed — ready to commit and push"

# ─────────────────────────────────────────────────────────────
# ASSET MANAGEMENT
# ─────────────────────────────────────────────────────────────
list-assets: ## List all files in public/assets/ by section folder
	@echo "Hero assets:"
	@ls frontend/public/assets/hero/ 2>/dev/null || echo "  (empty)"
	@echo "About assets:"
	@ls frontend/public/assets/about/ 2>/dev/null || echo "  (empty)"
	@echo "Service icons:"
	@ls frontend/public/assets/services/ 2>/dev/null || echo "  (empty)"
	@echo "Trainer photos:"
	@ls frontend/public/assets/trainers/ 2>/dev/null || echo "  (empty)"
	@echo "Gallery:"
	@ls frontend/public/assets/gallery/ 2>/dev/null || echo "  (empty)"
	@echo "Transformations:"
	@ls frontend/public/assets/transformations/ 2>/dev/null || echo "  (empty)"

# ─────────────────────────────────────────────────────────────
# CLEAN
# ─────────────────────────────────────────────────────────────
clean: ## Remove build artifacts and caches
	rm -rf frontend/dist frontend/.vite frontend/node_modules/.cache
	@echo "✅ Clean complete"

# ─────────────────────────────────────────────────────────────
# PHASE 2 REFERENCE (not active)
# ─────────────────────────────────────────────────────────────
phase2-info: ## Show what changes when backend is wired in Phase 2
	@echo ""
	@echo "  Phase 2 — Backend Wiring"
	@echo "  ──────────────────────────────────────────────────────"
	@echo "  Files that change (frontend only):"
	@echo "    src/services/publicService.ts  → swap JSON reads for Axios calls"
	@echo "    src/utils/buildAssetUrl.ts     → swap /assets/ path for Supabase Storage URL"
	@echo "    package.json                   → add axios, zustand, react-hook-form, zod"
	@echo "    .env.example                   → add VITE_API_BASE_URL, VITE_SUPABASE_*"
	@echo ""
	@echo "  Files that are added (new):"
	@echo "    src/services/api.ts            → Axios instance + JWT interceptor"
	@echo "    src/store/authStore.ts         → Zustand auth state"
	@echo "    src/pages/auth/               → Member + admin login pages"
	@echo "    src/pages/member/             → 3 member portal pages"
	@echo "    src/pages/admin/              → 11 admin dashboard pages"
	@echo ""
	@echo "  Files that NEVER change:"
	@echo "    All 8 public pages, all components, all hooks, all types,"
	@echo "    all utilities, design system, SEO, public routing"
	@echo ""
	@echo "  Backend specs ready in: docs/ARCHIVED/"
	@echo ""
