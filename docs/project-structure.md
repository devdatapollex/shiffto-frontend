# SHIFFTO Frontend — Project Structure

Canonical map of the repository. Update this file whenever files or directories change.

## Root Config Files

| File                 | Purpose                                                                           |
| -------------------- | --------------------------------------------------------------------------------- |
| `next.config.ts`     | Next.js config. API rewrites: `/api/:path*` → `${BACKEND_URL}/api/:path*`         |
| `proxy.ts`           | Next 16 middleware (renamed from `middleware.ts`). Cookie-presence auth gate.     |
| `tsconfig.json`      | TypeScript config. Strict mode, `@/*` → `./*` alias, bundler resolution.          |
| `components.json`    | shadcn/ui config. Style: `new-york`, RSC: true, icon library: `lucide`.           |
| `eslint.config.mjs`  | ESLint 9 flat config. `eslint-config-next` core-web-vitals + typescript.          |
| `.prettierrc`        | Prettier config. Single quotes, 100 char width, trailing commas, LF line endings. |
| `postcss.config.mjs` | PostCSS with `@tailwindcss/postcss` (Tailwind v4).                                |
| `package.json`       | Project manifest. Scripts, dependencies, lint-staged config.                      |
| `next-env.d.ts`      | Next.js generated TypeScript declarations (auto-managed).                         |
| `proxy.ts`           | Next 16 auth middleware (`getSessionCookie` gate).                                |

---

## `app/` — App Router

```
app/
├── layout.tsx              Root layout: ThemeProvider → QueryProvider → Toaster.
│                           Fonts: Outfit (--font-outfit) + Inter (--font-inter).
│                           Metadata via constructMetadata().
├── page.tsx                Server-side redirect → /dashboard
├── globals.css             Tailwind v4 theme: HSL CSS vars, .dark overrides,
│                           shadcn neutral base, deep-red primary hsl(353 93% 42%).
├── error.tsx               Global error boundary (client). Logs via logger, shows
│                           stack trace in development only.
├── loading.tsx             Global loading UI (spinner).
├── not-found.tsx           Global 404 page.
├── favicon.ico
│
├── (auth)/                 Route group — split-screen marketing layout
│   ├── layout.tsx          Left pane: brand messaging + icons. Right pane: children.
│   ├── login/page.tsx      Email/password form + Google social sign-in.
│   └── register/page.tsx   Email/password + terms checkbox + Google social sign-up.
│
└── (dashboard)/            Route group — app shell (sidebar + header)
    ├── layout.tsx          Client layout: <Sidebar> + <DashboardHeader> + main (max-w-7xl).
    ├── dashboard/
    │   └── page.tsx        Dashboard home. Static data (hardcoded zeros). Session greeting.
    └── admin/
        └── commission/page.tsx   Admin Commission Settings page.
```

**Note:** No Route Handlers (`route.ts`) exist. All API calls are proxied through `next.config.ts` rewrites to `BACKEND_URL`. Only `/`, `/login`, `/register`, `/dashboard` have page components. Other routes declared in `config/routes.ts` are not yet implemented.

---

## `components/` — React Components

```
components/
├── auth/
│   ├── role-guard.tsx          <RoleGuard roles fallback?> — renders fallback if
│   │                           user lacks one of the allowed roles.
│   └── permission-guard.tsx    <PermissionGuard permission fallback?> — renders
│                               fallback if user lacks the specified permission.
│
├── dashboard/
│   ├── header.tsx              DashboardHeader — sticky top bar with search,
│   │                           notifications bell, profile dropdown (logout via
│   │                           authClient.signOut + router.push).
│   ├── sidebar-new.tsx         Sidebar — collapsible nav with motion/react animations.
│   │                           Filters menu items by role/permission via useRole().
│   │                           Mobile drawer with backdrop overlay.
│   └── index.ts                Barrel re-export: Sidebar.
│
├── icons/
│   └── google-icon.tsx         Inline multi-path SVG Google "G" logo.
│
├── providers/
│   ├── theme-provider.tsx      'use client' wrapper around next-themes NextThemesProvider.
│   └── query-provider.tsx      'use client' QueryClientProvider. Default options:
│                               staleTime 60s, gcTime 5min, retry 1,
│                               refetchOnWindowFocus false. Includes ReactQueryDevtools.
│
└── ui/                         shadcn/ui primitives (new-york style, 14 components)
    ├── accordion.tsx           Radix accordion.
    ├── badge.tsx               CVA-based badge.
    ├── button.tsx              Radix Slot + CVA. Extended sizes: xs, icon-xs, icon-sm, icon-lg.
    ├── card.tsx                Pure card components (Card, CardHeader, etc.).
    ├── checkbox.tsx            Radix checkbox.
    ├── dialog.tsx              Radix dialog.
    ├── dropdown-menu.tsx       Radix dropdown menu.
    ├── form.tsx                react-hook-form + Radix label integration. Exports
    │                           Form, FormField, FormItem, FormLabel, FormControl,
    │                           FormDescription, FormMessage, useFormField.
    ├── input.tsx               Styled input.
    ├── label.tsx               Radix label.
    ├── pagination.tsx          Pure pagination components.
    ├── select.tsx              Radix select.
    ├── table.tsx               Styled table components (Table, TableHeader, TableRow, etc.).
    └── tabs.tsx                Radix tabs.
```

---

## `config/` — Application Configuration

| File              | Purpose                                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `env.config.ts`   | Zod-validated env vars (`BACKEND_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_ENV`, `NODE_ENV`). All have defaults. Throws in dev on invalid vars. Also exports `siteConfig` (name, description, links). |
| `permissions.ts`  | **better-auth access-control definitions.** Resources: `shipment`, `trip`, `settlement`, `withdrawal`. Roles: `user`, `admin`. **Must be shared with backend `auth.ts`.**                                                         |
| `roles.config.ts` | Frontend-only role config. `UserRole = 'user' \| 'admin'`. `ROLE_PERMISSIONS` map (admin = `['*']`). `isAuthorized(role, path)` helper.                                                                                           |
| `routes.ts`       | `ROUTES` object (`as const`). `PUBLIC_ROUTES` array. `DEFAULT_LOGIN_REDIRECT`.                                                                                                                                                    |
| `seo.config.ts`   | `seoConfig` (title, description, keywords, ogImage). `constructMetadata()` — duplicate of `utils/metadata.util.ts` (layout uses the utils version).                                                                               |

---

## `constants/` — Application Constants

| File            | Purpose                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `menu-items.ts` | `MenuItem` interface (`label`, `href`, `icon: LucideIcon`, optional `roles?`, `permission?`). `DASHBOARD_MENU_ITEMS` array (8 items). Admin-only: Settlements, Withdrawals, Users. |

---

## `hooks/` — Custom React Hooks

| File          | Purpose                                                                                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `use-role.ts` | Central access-control hook. Wraps `useSession()` from better-auth. Returns `role`, `isAdmin`, `isUser`, `user`, `isAuthenticated`, `isPending`, `hasPermission(resource:action)`, `checkAccess(allowedRoles[])`. |

---

## `lib/` — Core Libraries & Utilities

| File                  | Purpose                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `utils.ts`            | `cn(...inputs)` — clsx + tailwind-merge helper. Single import location (`@/lib/utils`).                                                                                                                                                                                                                                                          |
| `auth-client.ts`      | better-auth React client. `createAuthClient` with `adminClient` plugin (wired to permissions). Custom `fetchPlugin` for SSR cookie propagation (`next/headers`). Exports `signIn`, `signUp`, `signOut`, `useSession`.                                                                                                                            |
| `api-client.ts`       | Preconfigured axios instance. `baseURL: env.NEXT_PUBLIC_API_URL` (default `/api/v1`), `withCredentials: true`, 15s timeout. Request interceptor logs via logger. Response interceptor: 401 → redirect `/login`, 403 → warning log. Rejects normalized `{ message, status, data, originalError }`. **Not yet imported anywhere in the codebase.** |
| `logger.ts`           | Leveled logger (`log`/`info`/`warn`/`error`/`debug`/`table`). Non-error logs disabled outside development. Timestamps + colors. **Redacts sensitive keys** (`password`, `token`, `secret`, `auth`, `key`).                                                                                                                                       |
| `validations/auth.ts` | Zod schemas: `loginSchema` (email + password), `registerSchema` (name + email + password + terms boolean). Co-located inferred types: `LoginValues`, `RegisterValues`.                                                                                                                                                                           |

---

## `services/` — API Service Layer

| File                       | Purpose                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `admin-setting.service.ts` | Service wrapper for `/admin/settings` and `/admin/settings/commission-rate` API calls. |

---

## `store/` — Zustand State Stores

Empty directory. Zustand is installed as a dependency (`^5.0.11`) but no stores have been implemented yet.

---

## `utils/` — Utility Functions

| File               | Purpose                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metadata.util.ts` | `constructMetadata({ title, description, image, noIndex })` → Next.js `Metadata`. Uses `seoConfig` from `config/seo.config.ts`. Template: `%s — SHIFFTO`. **This is the version imported by `app/layout.tsx`.** |

---

## `public/` — Static Assets

Served at `/`. Contains favicon and any static images/icons used by the app.

---

## `.husky/` — Git Hooks

| File         | Purpose                 |
| ------------ | ----------------------- |
| `pre-commit` | Runs `npx lint-staged`. |

`lint-staged` config (in `package.json`): `*.{js,jsx,ts,tsx}` → `eslint --fix` + `prettier --write`; `*.{json,css,md}` → `prettier --write`.
