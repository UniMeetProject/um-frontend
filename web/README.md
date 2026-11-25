# UniMeet web

This is the UniMeet Campusplaner design exported from Lovable. It runs on local demo data.

## Authentication

Accounts use the Nest backend in `../../um-backend`. Configure its `.env` from `.env.example`, supply PostgreSQL credentials and independent random JWT secrets. For the local database, start Docker Desktop and run `docker compose up -d --wait db` in the backend directory. Keep `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` consistent with the two database URLs. Then run `npm ci`, `npx prisma generate`, `npx prisma migrate deploy` and `npm run start:dev`. The container stores PostgreSQL data in a persistent Docker volume.

The frontend uses `http://localhost:3000` by default. Copy `.env.example` to `.env.local` to set `VITE_API_URL` when using a different API origin. Add the frontend origin to the backend's comma-separated `FRONTEND_ORIGINS`. Start the frontend on port 5173 with `npm run dev -- --port 5173`.

Login accepts email or username. Registration requires a 3–32 character username and an 8–128 character password. The app loads `/auth/me`, retries expired access tokens through `/auth/refresh`, and revokes refresh tokens through `/auth/logout`. Logout applies to all backend sessions for the account.

Bearer tokens are kept in memory and browser sessionStorage so reloading the same tab restores the session. They are accessible to JavaScript, so this integration requires HTTPS in deployment and XSS prevention. Closing the tab removes its stored credentials. SSR renders only the account gate until the browser validates the session.

Groups, members, availability and meetings remain labeled examples in memory because the backend currently provides only account endpoints. Signing out unmounts that state. Password recovery and account editing require additional backend endpoints.

## Development

Run from this directory with Node.js and npm:

```sh
npx --yes bun install --frozen-lockfile
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
