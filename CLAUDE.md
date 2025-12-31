# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Galaxy is the infrastructure framework for MIT Battlecode, consisting of three main components:

- **Siarnaq**: Competitor dashboard with Django backend and React frontend
- **Saturn**: Compute cluster for compiling bots and running matches (Go)
- **Titan**: Malware scanner for file uploads (Go)

## Development Environment Setup

1. Install [Conda](https://docs.conda.io/en/latest/miniconda.html)
2. Create and activate environment: `conda env create -n galaxy -f environment-dev.yml && conda activate galaxy`
3. Install pre-commit hooks: `pre-commit install`
4. Update environment after upstream changes: `conda env update -n galaxy -f environment-dev.yml`

## Common Commands

### Backend (Django/Siarnaq)

From `backend/` directory:

```bash
# Database operations
./manage.py makemigrations      # Generate database migrations
./manage.py migrate              # Apply migrations
./manage.py runserver            # Start development server

# Testing
find * -type f -name "test*.py" | sed "s/\.py$//g" | sed "s/\//./g" | xargs coverage run --branch --source='.' ./manage.py test -v=2
coverage report                  # View test coverage

# Deployment checks
./manage.py check --deploy       # Verify production readiness
```

**Environment configuration**: Set `DJANGO_CONFIGURATION=Staging` to access staging environment (requires GCloud authentication).

### Frontend (React)

From `frontend/` directory:

```bash
# Development
npm install                      # Install dependencies (first time)
npm run start                    # Start dev server (http://localhost:3000)

# Code quality
npm run lint                     # Run ESLint and Prettier checks
npm run format                   # Apply ESLint and Prettier fixes

# Type generation
./generate_types.sh              # Generate TypeScript types from backend OpenAPI schema
```

**Important**: After backend API changes, run `./generate_types.sh` to regenerate TypeScript types in `src/api/_autogen/`.

### Pre-commit (All modules)

From root directory:

```bash
pre-commit run -a                # Run all pre-commit hooks on all files
```

Pre-commit runs: black, flake8, isort, mypy, pyupgrade (Python), go-fmt (Go), eslint, tsc (TypeScript).

### Go Modules (Saturn/Titan)

```bash
go fmt ./...                     # Format Go code
go test ./...                    # Run Go tests
```

## Architecture and Code Organization

### Backend (Siarnaq - Django)

Located in `backend/siarnaq/`:

- **`api/`**: API endpoints organized by domain (compete, episodes, teams, user)
- **Django apps**: User, teams, compete apps with models, managers, and signals
- **Settings**: Uses `django-configurations` with `Local`, `Staging`, and `Production` configurations
- **Authentication**: JWT-based with djangorestframework-simplejwt
- **API documentation**: Available at `api/specs/swagger-ui` endpoint

**Key principles**:
- Avoid loops; use Django Signals instead
- Be careful with concurrency; use transactions only when absolutely necessary
- Move complex logic into Managers for cleaner implementation
- Use type annotations; Mypy enforced by pre-commit

**Learning path for new Django contributors**:
1. Read `user/models.py`
2. Read `teams/models.py` (notice object methods and Django filters)
3. Read `compete/models.py` (notice double-underscore filters like `pk__in`)
4. Read `compete/managers.py` (understand Manager patterns)

### Frontend (React/TypeScript)

Located in `frontend/src/`:

- **`api/`**: API client code organized by domain, with auto-generated types in `_autogen/`
- **`components/`**: Reusable React components (elements, tables, sidebar, team, compete)
- **`views/`**: Page-level components mapped to routes
- **`contexts/`**: React contexts for shared state (e.g., user authentication)
- **`utils/`**: Utility functions
- **`content/`**: Static content and configuration

**Tech stack**:
- React 18 with TypeScript
- React Router for routing
- TanStack Query (React Query) for data fetching and caching
- Tailwind CSS for styling
- Headless UI for accessible components
- Vite for build tooling

**API integration**: Frontend communicates with backend via HTTP requests. Types are auto-generated from backend OpenAPI schema using `generate_types.sh`.

### Saturn (Go)

Compute cluster that compiles competitor bots and runs matches. Uses Pub/Sub subscriptions for job queuing.

### Titan (Go)

Antivirus scanning service triggered by Google EventArc when files are uploaded to storage buckets. Scans files tagged with `Titan-Status: Unverified` metadata.

## Deployment

Infrastructure managed with Terraform in `deploy/`:

```bash
terraform init                                    # Install modules
terraform plan -var-file="secret.tfvars"         # Preview changes
terraform apply -var-file="secret.tfvars"        # Apply changes
```

**Note**: `secret.tfvars` must be obtained from a team member.

## Code Quality Guidelines

### General Principles

- **ETU (Easy To Understand)**: Prioritize simplicity and clarity over cleverness
- **Modularity**: Clear separation between components
- **Single source of truth**: Derive/manipulate data in one place, pass as-is elsewhere
- **Avoid over-engineering**: Only implement what's requested; don't add unnecessary features, abstractions, or error handling for impossible scenarios
- **No premature optimization**: Three similar lines of code is better than a premature abstraction

### Django-Specific

- **Migrations**: Never edit generated migration files directly; excluded from linting
- **Security**: Be vigilant about SQL injection, XSS, command injection, and OWASP Top 10
- **Concurrency**: Use transactions judiciously; prefer Signals to loops

### Frontend-Specific

- **NPM packages**: Always use `npm install --save <package>` and commit both `package.json` and `package-lock.json`
- **Environment**: Local development uses `.env.development` automatically
- **Types**: Keep auto-generated types in `src/api/_autogen/` in sync with backend

## Testing

- **Backend**: Django unit tests using `./manage.py test`. Test files follow `test*.py` pattern.
- **Frontend**: TypeScript type checking with `npx tsc --noEmit`
- **CI**: GitHub Actions runs all checks on PRs and pushes to `main`

## Git Workflow

- Develop on feature branches (pushes to `main` are blocked)
- All PRs require at least one approval
- Pre-commit hooks enforce code quality
- Create GitHub Issues for tracking work; use priority labels (`critical`, `medium`, `low`) and module labels (`backend`, `frontend`)
- **No TODOs in code**: Create GitHub issues instead and reference them in comments

## Google Cloud Integration

For staging/production access:

```bash
gcloud auth application-default login --scopes=openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/userinfo.email
gcloud config set core/project mitbattlecode
gcloud auth login
```

Request "Service Account Token Creator" IAM role from a team member.

## Operations

See `backend/docs/operations.md` for common operational tasks like customer support and email management during the competition season.
