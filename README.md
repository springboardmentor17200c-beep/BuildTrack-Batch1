# BuildTrack-Batch1

## Backend (FastAPI)

The following commands are only for the Python FastAPI backend.

### First-time backend setup

Run these commands from the project root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
fastapi dev main.py
```

The virtual environment only needs to be created once on each developer's
computer. It is not committed to GitHub.

### Run the backend later

```powershell
cd backend
.venv\Scripts\Activate.ps1
fastapi dev main.py
```

Backend URLs:

- API: http://127.0.0.1:8000
- API documentation: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

Press `Ctrl+C` to stop the backend server.
