# TODO-app

## Run the backend with Docker Compose

Install and start Docker Desktop with Linux containers enabled. From the repository root:

```powershell
docker compose up --build -d
```

The API is available at http://localhost:3000, with tasks at
http://localhost:3000/tasks. Check status and logs with:

```powershell
docker compose ps
docker compose logs -f backend
```

SQLite runs inside the backend container; no separate database service is needed.
The `backend-data` named volume stores `/app/data/todo.db` and keeps data across
container restarts and rebuilds. The container starts with its own database and
does not copy or modify your local `api/todo.db`.

Stop the backend while retaining its data:

```powershell
docker compose down
```

`docker compose down --volumes` also deletes the database volume and its data.

To use a different host port in PowerShell:

```powershell
$env:API_PORT = '3001'
docker compose up -d
```

This Compose setup enables `DB_SYNCHRONIZE=true` to create the schema on first
startup for local use. For production, apply schema migrations and set it to
`false`. `DATABASE_PATH` controls the SQLite file location; outside Docker it
defaults to `todo.db` in the current working directory.
