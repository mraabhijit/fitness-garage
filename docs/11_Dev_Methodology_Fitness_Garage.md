# Development Methodology Document
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

---

## 1. Overview

This document defines the complete development methodology for the Fitness Garage project. Every feature, fix, and change — regardless of size — follows this workflow without exception. The methodology enforces code quality, prevents regressions, maintains a clean git history, and ensures every deliverable is reviewable before it reaches production.

**Governing Principles (inherited from all prior documents):**

| Principle | Enforcement Point |
|---|---|
| **DRY** | Pre-commit hooks + code review |
| **SOLID** | Code review checklist |
| **KISS** | Code review checklist — reject over-engineering |
| **YAGNI** | PR description — every line must map to a spec requirement |
| **Extensible** | Code review — new code must not require existing code to change for future additions |
| **Replaceable** | Code review — external services must be behind abstraction layers |

---

## 2. Branching Strategy

### 2.1 Branch Structure

```
main
  └── develop
        └── feature/<scope>/<short-description>
        └── fix/<scope>/<short-description>
        └── chore/<scope>/<short-description>
```

| Branch | Purpose | Deploys To |
|---|---|---|
| `main` | Production-ready code only | Vercel + Render (auto) |
| `develop` | Integration branch — all features merge here first | Staging (if configured) |
| `feature/**` | One branch per feature | Local only |
| `fix/**` | Bug fixes | Local only |
| `chore/**` | Non-functional changes (docs, config, deps) | Local only |

### 2.2 Branch Naming Convention

```
feature/frontend/hero-slideshow
feature/backend/bulk-member-import
feature/db/add-invoice-sequence
fix/frontend/otp-resend-countdown
fix/backend/pii-decrypt-null-handling
chore/infra/add-github-actions-ci
chore/docs/update-api-spec
```

**Rules:**
- All lowercase, hyphens only — no underscores, no camelCase
- Scope must be one of: `frontend`, `backend`, `db`, `infra`, `docs`
- Description is brief (3–5 words max)
- One feature per branch — never mix multiple features in one branch

---

## 3. Feature Development Workflow

Every feature follows these steps in strict sequence. No step is optional.

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1   Create feature branch from develop                        │
│  STEP 2   Build the feature using specialised skills                │
│  STEP 3   Review using Ponytail Skill                               │
│  STEP 4   Implement review changes                                  │
│  STEP 5   Test the feature (functional tests)                       │
│  STEP 6   Test regression (full test suite)                         │
│  STEP 7   Pre-commit checks pass                                    │
│  STEP 8   Commit changes                                            │
│  STEP 9   Push branch and create PR onto develop                    │
│  STEP 10  PR reviewed and merged                                    │
│  STEP 11  Delete feature branch                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Step-by-Step Workflow

### Step 1 — Create Feature Branch

Always branch from `develop`, never from `main`.

```bash
git checkout develop
git pull origin develop              # Always pull latest before branching
git checkout -b feature/<scope>/<description>

# Example:
git checkout -b feature/backend/bulk-member-import
```

**Before starting, confirm:**
- [ ] The feature is specified in the PRD or API Spec
- [ ] No other branch already covers this feature
- [ ] `develop` is up to date (pull before branching)

---

### Step 2 — Build the Feature Using Specialised Skills

Each feature type has a designated skill set. Use the correct tools for the work.

#### 2a. Backend Features (FastAPI + asyncpg)

**Skills to apply:**
- `db/queries/` — raw parameterized SQL only. No ORM. No string interpolation.
- `schemas/` — Pydantic v2 for all request/response validation
- `routers/` — thin route handlers. Business logic stays in `services/`
- `services/` — all business logic here
- `core/security.py` — always encrypt PII before write, decrypt after read
- `core/auth.py` — always apply `require_member` or `require_admin` dependency on protected routes

**Checklist before moving to review:**
- [ ] New query functions added to correct `db/queries/<resource>_queries.py`
- [ ] Pydantic schema covers all request fields with validation rules
- [ ] PII fields encrypted before DB write, decrypted after DB read
- [ ] Protected route uses `require_admin` or `require_member` dependency
- [ ] Response uses standard envelope `{ "data": ..., "message": "..." }`
- [ ] Soft delete used where applicable (not hard delete)
- [ ] No hardcoded values — all config from `core/config.py`

#### 2b. Frontend Features (React + TypeScript)

**Skills to apply:**
- `components/common/` — check if a shared component exists before creating a new one (DRY)
- `features/<domain>/` — feature-scoped components go here, not in `components/common/`
- `services/<domain>Service.ts` — all API calls via service modules, never direct axios in components
- `store/` — Zustand for shared state only; local `useState` for component-local state
- `utils/` — `buildStorageUrl`, `formatDate`, `formatCurrency` — always use these, never reinvent
- `constants/routes.ts` — always use route constants, never hardcoded strings

**Checklist before moving to review:**
- [ ] Component has a single responsibility (SOLID)
- [ ] No duplicate component exists in the library (DRY)
- [ ] API calls go through service module, not direct axios
- [ ] No hardcoded hex colors — Tailwind tokens only (`text-garage-chrome`)
- [ ] No hardcoded route strings — `ROUTES.*` constants only
- [ ] No JWT or auth state in `localStorage`
- [ ] Loading, error, and empty states all handled
- [ ] Fully responsive — tested at 375px, 768px, 1280px
- [ ] All images have `alt` attributes
- [ ] Destructive actions use confirmation modal

#### 2c. Database Features (SQL Migrations)

**Skills to apply:**
- New migration file: `db/migrations/<next_number>_<description>.sql`
- All SQL is idempotent using `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, `CREATE OR REPLACE`
- Update trigger attached for any new table with `updated_at` column
- RLS policies added for any table with member-facing data
- Seed data in a separate migration file from schema creation

**Checklist before moving to review:**
- [ ] Migration file is numbered correctly (no gaps, no duplicates)
- [ ] All DDL uses `IF NOT EXISTS`
- [ ] `updated_at` trigger attached to new tables
- [ ] RLS enabled and policies defined for member-facing tables
- [ ] Migration runner `db/migrate.py` tested — runs cleanly from scratch
- [ ] Migration is idempotent — running twice produces no error

---

### Step 3 — Review Using Ponytail Skill

After building the feature, before testing, invoke the **Ponytail Skill** for automated code review.

**What Ponytail Skill reviews:**

| Category | Checks |
|---|---|
| **Correctness** | Does the code do what the spec says? |
| **DRY violations** | Is any logic duplicated from existing code? |
| **SOLID violations** | Does any function/component do more than one thing? |
| **KISS violations** | Is there simpler code that achieves the same result? |
| **YAGNI violations** | Is any code built for a requirement not in the spec? |
| **Security** | PII encrypted? JWT checked? No secrets in code? |
| **SQL safety** | All queries parameterized? No string interpolation? |
| **TypeScript** | No `any` types? All props typed? |
| **Naming** | Consistent with project conventions? |
| **Error handling** | All API calls have error states? All edge cases handled? |
| **Accessibility** | All inputs labelled? Focus visible? Color not sole indicator? |

**Ponytail Skill invocation:**

```
Invoke: Ponytail Skill
Context: Provide the diff of all changed files
Spec reference: Reference the relevant section of the API Spec / Frontend Doc / DB Schema
Output: Line-by-line review with: PASS / WARN / FAIL per check
```

**Review outcome gates:**
- `FAIL` on any item → must be fixed before proceeding to Step 4
- `WARN` on any item → must be addressed or explicitly justified in PR description
- All `PASS` → proceed to Step 4

---

### Step 4 — Implement Review Changes

Address every `FAIL` and `WARN` from the Ponytail Skill review.

```bash
# Make changes based on review feedback
# Re-invoke Ponytail Skill on changed files only
# Confirm all FAILs resolved before proceeding
```

**Rules:**
- Do not skip or defer `FAIL` items — fix them now
- If a `WARN` is intentionally accepted, document the reason in the PR description
- Do not introduce new functionality during this step — only fix review findings

---

### Step 5 — Test the Feature

#### 5a. Backend Feature Testing

```bash
cd backend

# Run tests for the specific feature being built
uv run pytest tests/test_<feature>.py -v

# Test the endpoint manually via Swagger (dev only)
# http://localhost:8000/docs
```

**Manual test checklist per endpoint:**
- [ ] Happy path — correct request returns correct response
- [ ] Auth failure — no JWT returns `401`
- [ ] Role failure — wrong role JWT returns `403`
- [ ] Validation failure — invalid payload returns `422` with field errors
- [ ] Not found — non-existent resource ID returns `404`
- [ ] PII fields — verify ciphertext in DB, plaintext in API response

#### 5b. Frontend Feature Testing

```bash
cd frontend
npm run dev
```

**Manual test checklist per feature:**
- [ ] Feature works as specified in the relevant spec document
- [ ] Mobile layout correct at 375px
- [ ] Tablet layout correct at 768px
- [ ] Desktop layout correct at 1280px
- [ ] Loading state displays while data fetches
- [ ] Error state displays when API returns error
- [ ] Empty state displays when no data returned
- [ ] Keyboard navigation works (Tab key, Enter, Escape)
- [ ] No `console.error` in browser console
- [ ] No TypeScript errors in terminal

#### 5c. Database Migration Testing

```bash
cd backend

# Reset and re-run all migrations from scratch (local only)
uv run python -m app.db.migrate

# Verify in Supabase SQL editor:
# SELECT * FROM _migrations ORDER BY applied_at DESC;
# SELECT * FROM <new_table> LIMIT 5;
```

---

### Step 6 — Regression Testing

After feature tests pass, run the full test suite to confirm no existing functionality is broken.

```bash
cd backend

# Full test suite
uv run pytest tests/ -v --tb=short

# Expected: all tests pass
# If any test fails: fix before proceeding — do not suppress or skip
```

**Frontend regression check:**
```bash
cd frontend
npm run build    # TypeScript compile + Vite build — must succeed with zero errors
npm run lint     # ESLint — must pass with zero errors
```

**Acceptance gate:** 100% of existing tests must pass before committing. No exceptions.

---

### Step 7 — Pre-Commit Checks

Pre-commit hooks run automatically on `git commit`. They must all pass before the commit is accepted.

```bash
# Hooks run automatically on commit.
# To run manually before committing:
pre-commit run --all-files
```

**What runs (see `.pre-commit-config.yaml` for full config):**

| Hook | Language | Checks |
|---|---|---|
| `trailing-whitespace` | General | No trailing whitespace |
| `end-of-file-fixer` | General | Files end with newline |
| `check-yaml` | General | Valid YAML syntax |
| `check-json` | General | Valid JSON syntax |
| `check-merge-conflict` | General | No unresolved merge conflict markers |
| `detect-private-key` | General | No private keys committed |
| `black` | Python | Code formatting |
| `isort` | Python | Import ordering |
| `flake8` | Python | Style and lint |
| `mypy` | Python | Type checking |
| `bandit` | Python | Security vulnerability scan |
| `eslint` | TypeScript | Lint and style |
| `prettier` | TypeScript | Code formatting |

**If any hook fails:**
1. Read the error output — hooks are self-explanatory
2. Most formatting hooks (`black`, `prettier`, `isort`) auto-fix on run — just `git add` the changes and retry
3. `mypy`, `flake8`, `bandit`, `eslint` failures require manual code fixes
4. Do not bypass hooks with `--no-verify` — this defeats their purpose

---

### Step 8 — Commit Changes

```bash
git add .
git commit -m "<type>(<scope>): <description>"

# Examples:
git commit -m "feat(backend): add bulk member import endpoint"
git commit -m "feat(frontend): build hero slideshow with crossfade transition"
git commit -m "fix(backend): handle null phone_number in PII decrypt"
git commit -m "feat(db): add invoice_last_sequence to site_config seed"
git commit -m "chore(infra): add pre-commit hooks for Python and TypeScript"
```

**Commit message rules:**

| Part | Rule |
|---|---|
| `type` | `feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` |
| `scope` | `frontend` / `backend` / `db` / `infra` / `docs` |
| `description` | Lowercase, present tense, no period, max 72 chars total |

**One logical change per commit.** If you built two unrelated things, make two commits.

---

### Step 9 — Push Branch and Create Pull Request

```bash
git push origin feature/<scope>/<description>
```

Then open a Pull Request on GitHub: **`feature/<scope>/<description>` → `develop`**

**PR Title:** Same as the commit message for single-commit PRs.

**PR Description Template:**

```markdown
## What
<!-- One paragraph describing what was built or changed -->

## Why
<!-- Reference to the spec document and section that requires this change -->
<!-- Example: "Per API Spec Doc Section 5.1 — Members List endpoint" -->

## How
<!-- Brief explanation of approach taken — especially non-obvious decisions -->

## Spec Checklist
- [ ] Feature matches spec exactly — no additions, no omissions
- [ ] All acceptance criteria from Milestones Doc section X.X passing
- [ ] No YAGNI violations — no code built beyond what spec requires

## Test Evidence
- [ ] Feature tests passing: `pytest tests/test_<feature>.py -v`
- [ ] Full regression passing: `pytest tests/ -v`
- [ ] Frontend build passing: `npm run build`
- [ ] Manual test performed at 375px / 768px / 1280px

## Ponytail Review
- [ ] Ponytail Skill review completed
- [ ] All FAILs resolved
- [ ] WARNs accepted: <!-- list any accepted warnings and justification, or "None" -->

## Pre-Commit
- [ ] All pre-commit hooks passing

## Breaking Changes
<!-- List any breaking changes, or "None" -->

## Screenshots (Frontend PRs)
<!-- Add before/after screenshots for UI changes -->
```

---

### Step 10 — PR Review and Merge

**Reviewer checklist (human or agent reviewer):**

- [ ] PR description is complete — all checkboxes ticked
- [ ] Code matches the referenced spec — no scope creep
- [ ] No new `TODO` or `FIXME` comments committed
- [ ] No `console.log`, `print()`, or debug statements left in
- [ ] No hardcoded secrets, URLs, or magic values
- [ ] No `any` TypeScript types introduced
- [ ] No ORM or raw string SQL (parameterized queries only)
- [ ] No PII handled in plaintext outside of the decrypt layer
- [ ] Tests cover the new code path
- [ ] CI pipeline green (GitHub Actions)

**Merge strategy:** Squash and merge into `develop` — keeps history clean.

**After merge:** `develop` is ready for promotion to `main` once a release batch is complete.

**Promoting `develop` to `main` (release):**
```bash
git checkout main
git merge develop --ff-only
git tag v<major>.<minor>.<patch>
git push origin main --tags
```

---

### Step 11 — Delete Feature Branch

After the PR is merged:

```bash
# Delete remote branch (GitHub also shows "Delete branch" button after merge)
git push origin --delete feature/<scope>/<description>

# Delete local branch
git branch -d feature/<scope>/<description>

# Update local develop
git checkout develop
git pull origin develop
```

**Branch hygiene rule:** No merged branches left open. Delete immediately after merge.

---

## 5. Hotfix Workflow

For critical production bugs that cannot wait for the normal feature cycle:

```bash
# Branch from main — not develop
git checkout main
git checkout -b fix/<scope>/<description>

# Apply minimal targeted fix
# Run full regression: pytest tests/ -v
# Pre-commit checks pass
# Commit + push

# PR: fix/** → main (bypass develop for hotfixes only)
# After merge to main: also merge main back into develop
git checkout develop
git merge main
git push origin develop
```

Hotfix PRs still require the full PR description template and Ponytail Skill review.

---

## 6. CI Pipeline (GitHub Actions)

The CI pipeline runs automatically on every push to `feature/**`, `fix/**`, and `develop`, and on every PR to `develop` and `main`.

**Pipeline stages:**

```
Push / PR
    │
    ├── Backend CI
    │   ├── uv sync (install deps)
    │   ├── black --check (formatting)
    │   ├── isort --check (import order)
    │   ├── flake8 (lint)
    │   ├── mypy (type check)
    │   ├── bandit (security scan)
    │   └── pytest tests/ -v (all tests)
    │
    └── Frontend CI
        ├── npm ci (install deps)
        ├── npm run lint (ESLint)
        └── npm run build (TypeScript compile + Vite build)
```

**Gate rule:** PR cannot be merged if CI is red. No exceptions.

See `.github/workflows/ci.yml` for full configuration.

---

## 7. Code Review Principles

### 7.1 What to Look For

| Category | Question |
|---|---|
| Correctness | Does this do what the spec says — exactly? |
| DRY | Is this logic already defined somewhere? Can this reuse an existing component/function? |
| SOLID | Is this function/component doing more than one thing? |
| KISS | Is there a simpler way to achieve the same result? |
| YAGNI | Is any part of this not required by the current spec? |
| Security | Is PII handled correctly? Are all routes protected? Are there any injection risks? |
| Extensibility | Will adding a new feature here require rewriting this code? |
| Tests | Is the new code path covered by a test? |

### 7.2 Review Tone

Code review is about the code, not the person.

- Phrase feedback as questions or suggestions: "Could this use the existing `Badge` component?" not "This is wrong."
- Label comment severity: `[MUST]` for blockers, `[SHOULD]` for strong suggestions, `[NIT]` for minor style points
- `[MUST]` comments must be resolved before merge
- `[SHOULD]` and `[NIT]` comments are addressed at the author's discretion

### 7.3 What Reviewers Do Not Do

- Rewrite the code for the author — suggest, don't replace
- Block PRs on personal style preferences not covered by the linter
- Approve PRs with unresolved `[MUST]` comments

---

## 8. Definition of Done

A feature is **Done** when all of the following are true:

| # | Criterion |
|---|---|
| 1 | Code matches the spec — no more, no less |
| 2 | Ponytail Skill review completed — all FAILs resolved |
| 3 | Feature tests passing |
| 4 | Full regression suite passing |
| 5 | Pre-commit hooks passing |
| 6 | PR description complete with all checkboxes ticked |
| 7 | CI pipeline green |
| 8 | PR merged to `develop` |
| 9 | Feature branch deleted |
| 10 | No `TODO`, `FIXME`, `console.log`, `print()`, or debug code left in |

A feature that does not meet all 10 criteria is **not Done**.

---

## 9. What Never Goes Into a Commit

| Item | Reason |
|---|---|
| `.env` files | Contains secrets |
| `AES_ENCRYPTION_KEY` | Critical secret — Render env var only |
| `SUPABASE_SERVICE_KEY` | Critical secret — Render env var only |
| Private keys or certificates | Security risk |
| `node_modules/` | Regenerated from `package.json` |
| `.venv/` or `__pycache__/` | Regenerated from `pyproject.toml` |
| Build output (`dist/`, `.next/`) | Generated at deploy time |
| Database dumps with real data | PII risk |
| `console.log()` or `print()` debug statements | Code quality |
| Commented-out code | Use git history instead |
| Hardcoded passwords or API keys | Security risk |

---

## 10. Release Versioning

Semantic versioning: `MAJOR.MINOR.PATCH`

| Increment | When |
|---|---|
| `PATCH` (0.0.X) | Bug fixes, minor content changes |
| `MINOR` (0.X.0) | New features added (backwards compatible) |
| `MAJOR` (X.0.0) | Breaking changes, major architectural changes |

**At launch:** Version is `v1.0.0`

Tag every release:
```bash
git tag v1.0.0 -m "Initial production release"
git push origin --tags
```

---

*End of Development Methodology Document — Fitness Garage v1.0*
