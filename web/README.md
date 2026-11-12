# Taskspace frontend

Next.js App Router task manager with shadcn/ui components and a NestJS API proxy.

## Run locally

1. Start the existing NestJS backend on port 3000.
2. Copy `.env.example` to `.env.local` and adjust `API_BASE_URL` if needed.
3. Run `npm install`, then `npm run dev -- --port 3001`.
4. Open http://localhost:3001.

The frontend and backend must use different ports. API requests go through `/api/tasks`, so the backend does not require browser CORS configuration.

Task types and HTTP requests live in `services/tasks.service.ts`. The `hooks/use-tasks.ts` hook uses SWR for list caching and revalidation, and `useSWRMutation` for create, update, and delete operations. Successful mutations update the cached list and revalidate it against the API. The page handles presentation, form state, and toast feedback.

Includes task creation, editing, deletion confirmation, status badges, search, filters, due-date sorting, pagination, skeleton loading, retryable errors, and success toasts. All backend pages are loaded for accurate counts and client-side search. Existing due dates can be changed but cannot be removed because the backend rejects null and empty dates.

Validation: `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

## Docker

From this `web` directory, start the frontend and existing backend together:

```sh
docker compose up -d --build
```

Open http://localhost:3001. This Compose file includes `../compose.yaml` and shares its backend service and database volume under the `todo-app` project. Requires Docker Compose 2.20.3 or newer. The frontend calls `http://backend:3000` inside Docker; the included backend configuration explicitly sets its internal port to 3000. Local `.env` files are excluded from the image.

After changing frontend code, rebuild and replace only the frontend:

```sh
docker compose up -d --build --no-deps frontend
```

To update both services, use `docker compose up -d --build` again. View frontend logs with `docker compose logs -f frontend`. Set `FRONTEND_PORT` to change the published frontend port.

The multi-stage Dockerfile builds Next.js standalone output and runs it as a non-root user. To use an API outside this Compose stack instead:

```sh
docker build -t taskspace-web .
docker run -d --name taskspace-web -p 3001:3000 -e API_BASE_URL=http://host.docker.internal:4000 taskspace-web
```

That example targets an API on the Docker Desktop host at port 4000. Adjust the URL to your API's address. `API_BASE_URL` is supplied at runtime and does not require rebuilding the image.
