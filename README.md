# brisk-ui

Web-based GUI for the brisk ML framework, distributed as a separate Python package with a FastAPI backend and React frontend.

## Architecture

```
User runs: brisk ui
    │
    ▼
┌─────────────────────────────────────┐
│  brisk CLI (main package)           │
│  - Validates project directory      │
│  - Checks brisk-ui is installed     │
│  - Starts uvicorn server            │
│  - Opens browser                    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  brisk-ui (this package)            │
│  ┌─────────────────────────────────┐│
│  │ FastAPI Backend                 ││
│  │ - /api/* routes                 ││
│  │ - Reads SQLite via brisk        ││
│  │ - Reads/writes Python configs   ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Static Files (React build)      ││
│  │ - Served at /                   ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- Poetry

### Setup

```bash
# Install Python dependencies
poetry install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Development Mode (Hot Reload)

Development mode runs the backend and frontend separately, allowing for hot reloading of both.

**Terminal 1: Backend**

```bash
poetry run brisk-ui-dev
```

This starts the FastAPI backend on port 8050 with:
- API routes at http://localhost:8050/api
- OpenAPI docs at http://localhost:8050/docs
- CORS enabled for the frontend dev server

**Terminal 2: Frontend**

```bash
cd frontend && npm run dev
```

This starts the Vite dev server on port 3000 with hot module replacement.

Open http://localhost:3000 to view the app.

### Test Mode (Static Files)

Test mode serves the pre-built frontend from `brisk_ui/static/`, simulating production deployment.

**Step 1: Build the frontend**

```bash
poetry run build-frontend
```

This compiles the React app and copies it to `brisk_ui/static/`.

**Step 2: Run in test mode**

```bash
poetry run brisk-ui-dev --mode test
```

Open http://localhost:8050 to view the app.

### Command Options

```bash
# Run with a specific project directory
poetry run brisk-ui-dev /path/to/brisk/project

# Run on a different port
poetry run brisk-ui-dev --port 9000

# Run in test mode with custom project
poetry run brisk-ui-dev /path/to/project --mode test --port 8080
```

### Create Mode (New Project)

Create mode allows you to test the project creation workflow without an existing project.

**Terminal 1: Backend with --create flag**

```bash
# Specify the parent directory where projects will be created
poetry run brisk-ui-dev ./projects --create
```

This will:
- Create the parent directory if it doesn't exist
- Skip the database validation
- Set the app to "create mode"

**Terminal 2: Frontend**

```bash
cd frontend && npm run dev
```

The app will automatically redirect to `/project` where you can:
1. Fill out the project information form (the project name becomes the directory name)
2. Navigate through all 8 wizard steps
3. Click "Create Project" on the final step to save files

**Example:** If you enter "My Cool Project" as the project name, it will create:
```
./projects/my-cool-project/
└── .brisk/
    └── .env
```

After creating, you can restart without `--create` to test editing:
```bash
poetry run brisk-ui-dev ./projects/my-cool-project
```

## Project Structure

```
brisk-ui/
├── pyproject.toml
├── brisk_ui/
│   ├── __init__.py
│   ├── server.py              # FastAPI app factory
│   ├── config.py              # Dev/prod configuration
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py    # DI for settings/services
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py
│   │       ├── test.py        # Test integration endpoints
│   │       └── configs.py
│   ├── services/
│   │   └── database.py
│   └── static/                # React build output (generated)
├── frontend/                  # React source (not distributed)
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── api/               # API client
│       │   ├── client.ts
│       │   └── test.ts
│       └── features/
├── dev/
│   ├── run_dev.py             # Dev entrypoint
│   ├── build_frontend.py      # Frontend build script
│   └── backend-dev/           # Test project directory
└── tests/
```

## Testing the Integration

The dashboard includes a test integration component that demonstrates frontend-backend communication:

1. Start the app in either dev or test mode
2. Navigate to the dashboard (home page)
3. In the "Result Summary" section, enter text in the input field
4. Click "Transform" to send the text to the backend
5. The backend splits the text into individual characters, capitalizes each, and returns them
6. The frontend displays each letter in a styled badge

This test confirms:
- Frontend can reach the backend API
- CORS is configured correctly (in dev mode)
- Request/response serialization works
- The build process works (in test mode)
