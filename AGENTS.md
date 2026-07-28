# Memory

## Project Overview

See @README.md for project overview and @package.json for available npm/pnpm commands for this project.

## Project Structure

See [docs/project-structure.md](./docs/project-structure.md) for the full annotated directory tree.

## Tech Stack

| Layer            | Technology                                                             |
| ---------------- | ---------------------------------------------------------------------- |
| Framework        | Next.js 16.1.6 (App Router), React 19.2.3                              |
| Language         | TypeScript 5, strict mode                                              |
| Styling          | Tailwind CSS v4 (CSS-first, no JS config) + shadcn/ui (new-york style) |
| Auth             | better-auth (client-side) + adminClient plugin (RBAC)                  |
| Data fetching    | @tanstack/react-query + axios (provisioned, not yet consumed)          |
| State management | zustand (installed, stores not yet implemented)                        |
| Forms            | react-hook-form + zod (v4) + @hookform/resolvers                       |
| Dark mode        | next-themes (class-based toggle)                                       |
| Toasts           | sonner                                                                 |
| Animation        | motion (Framer Motion)                                                 |
| Icons            | lucide-react                                                           |

**Note:** This is a client-only frontend. The backend runs separately at `BACKEND_URL` (default `http://localhost:5000`). `config/permissions.ts` must be kept in sync with the backend's `auth.ts`.

## Architecture

### Auth & Authorization

- **Client setup:** `lib/auth-client.ts` — `createAuthClient` with `adminClient` plugin. Custom `fetchPlugin` propagates server-side cookies via `next/headers` for SSR.
- **Access control:** `config/permissions.ts` — resources: `shipment`, `trip`, `settlement`, `withdrawal`. Roles: `user` (shipments + trips), `admin` (all + adminAc defaults). **Must stay in sync with backend.**
- **Role config:** `config/roles.config.ts` — frontend-only path-based role config with `isAuthorized(role, path)`.
- **Hook:** `hooks/use-role.ts` — wraps `useSession()`, exposes `role`, `isAdmin`, `hasPermission(resource:action)`, `checkAccess(allowedRoles[])`.
- **Guard components:** `components/auth/role-guard.tsx` and `components/auth/permission-guard.tsx` — render `fallback` (default `null`) when access denied.
- **Forms:** Login/register use `react-hook-form` + `zodResolver`, submit via `authClient.signIn.email` / `authClient.signUp.email`, Google social via `authClient.signIn.social`. Errors → `toast.error`, success → `toast.success` + `router.push` + `router.refresh()`.
- **Schemas:** `lib/validations/auth.ts` — `loginSchema`, `registerSchema` with co-located inferred types.

### Routing

- **Route groups:** `(auth)` (split-screen marketing layout) and `(dashboard)` (sidebar + header shell).
- **Routes constant:** `config/routes.ts` — `ROUTES`, `PUBLIC_ROUTES`, `DEFAULT_LOGIN_REDIRECT`.
- **Implemented pages:** `/` (redirect → `/dashboard`), `/login`, `/register`, `/dashboard` (static data).
- **Not yet implemented:** `/dashboard/shipments`, `/dashboard/trips`, `/dashboard/finances`, `/dashboard/account`, `/dashboard/settlements`, `/dashboard/withdrawals`, `/dashboard/users`, `/unauthorized`.
- **No Route Handlers** — all API calls go through `next.config.ts` rewrites.

### Data Layer (API / Query / State)

- **Axios client:** `lib/api-client.ts` — `baseURL: NEXT_PUBLIC_API_URL` (default `/api/v1`), `withCredentials: true`, 15s timeout, 401 → redirect `/login`, normalized error shape `{ message, status, data, originalError }`. **Not yet imported anywhere.**
- **React Query:** `components/providers/query-provider.tsx` — wired in root layout, `staleTime: 60s`, `gcTime: 5min`, `retry: 1`, includes devtools. **No hooks or mutations implemented yet.**
- **Zustand:** `store/` directory exists but is empty. Installed as dependency, not yet used.
- **API proxy:** `next.config.ts` rewrites `/api/:path*` → `${BACKEND_URL}/api/:path*` (avoids CORS, carries cookies).

### Middleware / Proxy

- `proxy.ts` (root) — Next 16 renamed `middleware.ts` to `proxy.ts`.
- Uses `getSessionCookie` from `better-auth/cookies` (cookie-presence check only, no DB verification).
- Unauthenticated + non-public route → redirect to `/login?callbackUrl=<pathname>`.
- Authenticated + visiting `/login` or `/register` → redirect to `/dashboard`.
- Matcher excludes: `api`, `_next/static`, `_next/image`, `favicon.ico`, `assets`.

### Styling & Theming

- **Tailwind v4** — CSS-first config in `app/globals.css`. No `tailwind.config.js`.
- **Color tokens** — HSL CSS custom properties. Brand primary: `hsl(353 93% 42%)` (deep red), consistent across light/dark.
- **Dark mode** — `next-themes` with `attribute="class"`, `defaultTheme="light"`, `.dark` custom variant.
- **Fonts** — Outfit (`--font-outfit`, headings) + Inter (`--font-inter`, body), loaded via `next/font/google`.
- **`cn()` helper** — `lib/utils.ts` — clsx + tailwind-merge. Single import location for all components.

### Environment

- **Validated config:** `config/env.config.ts` — zod schema with defaults. Throws in development on invalid vars, logs in other envs.
- **5 env vars** (all defaulted): `BACKEND_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_ENV`, `NODE_ENV`.
- **No `.env.example` committed.** The expected local file is `.env.local` (Next.js convention).

## Code Conventions

- **File naming:** kebab-case (`sidebar-new.tsx`, `use-role.ts`, `metadata.util.ts`, `roles.config.ts`).
- **Component naming:** PascalCase exports.
- **Hook naming:** `use-` prefix, kebab-case filename.
- **Constants:** UPPER_SNAKE_CASE (`ROUTES`, `PUBLIC_ROUTES`, `DASHBOARD_MENU_ITEMS`).
- **Path alias:** `@/*` → `./*` (workspace root). Use `@/components/...`, `@/lib/...`, `@/config/...`, `@/hooks/...`.
- **Client/server boundary:** Explicit `'use client'` directive on all interactive components (forms, guards, providers, dashboard shell, error.tsx).
- **Import order:** External libs → Next/React → local `@/` modules, with blank line between groups.
- **Toasts over thrown errors:** Form handlers check `error` from auth/API calls, `toast.error()` the message, then redirect. Never throw to error boundaries for expected auth failures.
- **Polymorphic components:** `asChild` + Radix `Slot` pattern (Button, dropdown triggers).
- **Barrel re-exports:** Grouped components use `index.ts` barrel files (`components/dashboard/index.ts`).
- **Descriptive variables:** Extract complex conditions into meaningful boolean variables.
- **Zod schemas + types:** Co-locate schema and inferred type (`loginSchema` + `LoginValues`).

## Agent Workflow & Conventions

- **Keep docs in sync:** After any change to behavior, structure, routes, scripts, dependencies, or conventions — review and update `AGENTS.md` + `docs/` **before continuing** so future agents do not rely on stale context.
- **Project structure doc:** `docs/project-structure.md` is the canonical structure map. Update it when files or directories change.
- **Atomic conventional commits:** Commit each distinct topic separately with a meaningful conventional-commit message and a detailed commit body describing what changed and why. Never bundle unrelated changes (e.g., dependency changes and feature logic) into a single commit — split them into focused commits even if they were developed together.
- **Verification before completion:** Use `verification-before-completion` skill before claiming work is complete or fixed. Run verification commands and show evidence before assertions.
- **Architecture improvements:** Use `improve-codebase-architecture` skill when making structural changes, introducing module seams, or evaluating refactors.
- **Frontend/UI work:** Use `frontend-design` and `web-design-guidelines` skills when building or reviewing UI/UX.
- **Auth work:** Use `better-auth-best-practices` and `better-auth-security-best-practices` skills when modifying authentication or authorization code.
- **Update after changes:** Update relevant documentation after each meaningful change. Do not batch doc updates at the end.

## Common Workflows & Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint (flat config, eslint-config-next)
npm run format       # Prettier --write .
npm run format:check # Prettier --check .
```

- **Pre-commit hook:** `.husky/pre-commit` runs `npx lint-staged`. Staged `*.{js,jsx,ts,tsx}` files get `eslint --fix` then `prettier --write`. Staged `*.{json,css,md}` files get `prettier --write`.
- **Adding shadcn components:** Use `npx shadcn@latest add <component>`. Config in `components.json` (new-york style, RSC, lucide icons).
- **Environment:** Copy `.env.local` with vars listed in `config/env.config.ts`. All have sensible defaults for local development.
