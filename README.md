# TODO-app

A task manager with a NestJS backend (`api`), Next.js frontend (`web`), and SQLite database.

## Prerequisites

- Git.
- Node.js **24.x**, matching the project's Docker images.
- **npm 11.x**, bundled with Node.js 24. Use the committed npm lockfiles with `npm ci`.
- Free ports **3000** for the backend and **3001** for the frontend.

Commands below use PowerShell. If PowerShell blocks `npm.ps1`, replace `npm` with `npm.cmd` throughout. Check your installation:

```powershell
node --version
npm.cmd --version
```

SQLite dependencies use native modules. If installation needs to compile them, install Python 3 and C++ build tools (Visual Studio Build Tools with Desktop development with C++ on Windows; Python, make, and g++ on Linux). The Docker option below includes the build dependencies.

## 1. Clone and install dependencies

```powershell
git clone https://github.com/notRandula98/TODO-app.git
cd TODO-app
cd api
npm ci
cd ../web
npm ci
cd ..
```

Install dependencies separately in both directories; there is no root npm package.

## 2. Configure environment variables

From the repository root, create the backend configuration and copy the frontend example:

```powershell
@"
NODE_ENV=development
PORT=3000
DATABASE_PATH=todo.db
DB_SYNCHRONIZE=true
"@ | Set-Content -Encoding ascii api/.env

Copy-Item web/.env.example web/.env.local
```

These commands replace the named local configuration files. `web/.env.local` must contain:

```dotenv
API_BASE_URL=http://127.0.0.1:3000
```

| Variable | File | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `api/.env` | `development` for local use. |
| `PORT` | `api/.env` | Backend listening port: `3000`. |
| `DATABASE_PATH` | `api/.env` | SQLite file path, relative to the backend working directory. `todo.db` becomes `api/todo.db`. |
| `DB_SYNCHRONIZE` | `api/.env` | `true` creates and updates the task schema on startup for local review. |
| `API_BASE_URL` | `web/.env.local` | Backend URL used by the frontend's server-side API proxy. |

No API keys, accounts, or database credentials are required. Shell environment variables override values in environment files. Restart the relevant server after changes. If you change the backend port, update `API_BASE_URL` to match. Automatic schema synchronization is intended for local use; production schema changes should use migrations.

## 3. Start the backend and initialize SQLite

In a terminal at the repository root:

```powershell
cd api
npm run start:dev
```

Keep this terminal running. With the configuration above, TypeORM automatically creates `api/todo.db` and the `tasks` table at startup. No separate SQLite installation, database server, migration command, or seed step is required. The initial task list is empty. Tasks persist in this file across restarts. If you choose another database path, create its parent directory first.

Do not run `npm run db:init` for this setup: it initializes a separate `t_tasks` table that the API does not use.

Verify the backend in another terminal:

```powershell
Invoke-RestMethod http://localhost:3000/tasks
```

For a fresh database, the response is:

```json
{ "data": [], "total": 0, "page": 1, "limit": 10, "totalPages": 0 }
```

## 4. Start the frontend

In a second terminal at the repository root:

```powershell
cd web
npm run dev -- --port 3001
```

Open **http://localhost:3001**. Keep both server terminals running. Create a task and refresh the page to confirm persistence. Frontend requests go through `/api/tasks` to the backend configured by `API_BASE_URL`.

Press `Ctrl+C` in each terminal to stop the servers. If port 3001 is occupied, choose another frontend port in the command. If the frontend cannot connect to the API, confirm the backend is running on port 3000 and check `web/.env.local`.

## Alternative: run both services with Docker Compose

Install and start Docker Desktop with Linux containers enabled and Docker Compose **2.20.3 or newer**. Host Node.js, npm installation, and local environment files are not required for this option. From a fresh clone's repository root:

```powershell
docker compose -f web/compose.yaml up --build -d --wait
docker compose -f web/compose.yaml ps
```

Open **http://localhost:3001**. The API is available at **http://localhost:3000/tasks**. Compose supplies both services' environment variables, configures the internal API URL, and enables automatic SQLite schema creation.

View logs:

```powershell
docker compose -f web/compose.yaml logs -f
```

Press `Ctrl+C` to leave the logs. Stop both services while retaining data:

```powershell
docker compose -f web/compose.yaml down
```

SQLite lives at `/app/data/todo.db` in the `backend-data` named volume, which survives restarts, rebuilds, and `down`. Adding `--volumes` to `down` deletes this database and its tasks. Docker uses a separate database from local `api/todo.db`.

The root `compose.yaml` starts only the backend; use `web/compose.yaml` as above for the complete app. Stop local servers first so the ports are free.

## Validation commands

From `api`:

```powershell
npm test
npm run test:e2e
npm run build
```

From `web`:

```powershell
npm run lint
npm run build
```

## How I used AI

I used OpenAI Codex to inspect the package scripts, environment configuration, SQLite setup, and Docker Compose files, and to rewrite this README. In the generated documentation, I clarified the commands for starting both services, their separate ports, the frontend API URL, and automatic creation of the API's `tasks` table. This update changed documentation only; no generated application code was modified in this session.
