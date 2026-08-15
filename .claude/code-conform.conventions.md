# push-notification-nextjs Conformance Scale

Repo-derived ruleset. Each rule: convention · detect · fix · severity (S1 Blocker / S2 Standard /
S3 Polish). Inferred from the code — the code is the source of truth; if a rule no longer matches,
update the rule, not the codebase.

**Inferred baseline:** TypeScript 5 (`strict: true`) on Next.js 16 App Router with React 19, Turbopack,
Tailwind CSS v4 (CSS-first, no `tailwind.config.*`). ESLint 9 flat config (`eslint.config.mjs`,
`next/core-web-vitals` + `next/typescript`). **No Prettier, no `.editorconfig`** — formatting is
hand-maintained, so the formatting rules below are real rules here, not tool-owned. **No test suite
exists** (no runner, no `*.test.*`/`*.spec.*`); do not invent test-convention findings. This is a
public sample/reference project — README accuracy is a first-class concern, not a nit.

## FMT — Formatting & file basics

- **FMT-1 (S3) Indentation: 4 spaces.** 96 lines at depth 4, 52 at 8, 60 at 12 — dominant and
  unambiguous. Exception: `src/app/globals.css` and root config files (`*.config.mjs`, `*.config.ts`,
  `tsconfig.json`, `package.json`) use 2, matching the create-next-app scaffold — **do NOT flag those**.
  Detect: `grep -nE "^  [^ ]" src --include='*.ts' --include='*.tsx'`. Fix: reindent to 4.
- **FMT-2 (S2) Double quotes everywhere.** 97 double-quoted strings, 0 single-quoted. Detect:
  `grep -rnE "'[^']*'" src --include='*.ts' --include='*.tsx'`. Fix: convert to `"`.
- **FMT-3 (S3) Semicolon-terminated statements.** Universal. Detect: visual/lint. Fix: add `;`.
- **FMT-4 (S3) No license/copyright headers.** The repo has none — **do NOT add them**.

## NAME — Naming & file layout

- **NAME-1 (S1) App Router reserved filenames.** `layout.tsx`, `page.tsx`, `route.ts` under `src/app/**`
  are resolved by the framework by name; the route path is the directory path
  (`src/app/api/web-push/send/route.ts` → `POST /api/web-push/send`). Detect: any rename of these, or a
  handler not exported as an uppercase HTTP verb (`export async function POST`). Fix: restore the
  convention — a mismatch 404s at runtime.
- **NAME-2 (S2) Components are `PascalCase.tsx` under `src/components/`,** one component per file, file
  named after the component. Detect: `find src/components -type f ! -name '[A-Z]*.tsx'`. Fix: rename.
- **NAME-3 (S2) Push/notification domain logic lives in `src/notifications/`,** named
  `Notification<Role>.ts` (`NotificationPush` = browser side, `NotificationSender` = server side);
  hooks/providers are `use<Thing>.tsx` (`useNotification.tsx`). Detect: new push logic added under
  `src/components/` or `src/app/`. Fix: move it into `src/notifications/`.

## REACT — Component & hook conventions

- **REACT-1 (S2) Components are arrow-function consts,** `const Foo = () => { ... }` (5 of 6; the lone
  `function` is `RootLayout`, which is scaffold-generated — **do NOT flag it**). Detect:
  `grep -rnE "^export function [A-Z]" src/components`. Fix: convert to a `const` arrow.
- **REACT-2 (S3) Export style is genuinely split** — 3 default (`layout`, `page`,
  `NotificationSubscriptionStatus`) vs named (`NotificationSubscriptionForm`,
  `UnsupportedNotificationMessage`). `layout.tsx`/`page.tsx` **must** stay default (framework contract,
  S1 if changed). For new components either is acceptable; match the neighbouring file. Not a violation.
- **REACT-3 (S2) `"use client"` sits on the entry that owns client state,** not on every leaf:
  `page.tsx` and `useNotification.tsx` carry it; the components under `src/components/` do not and rely
  on being in the caller's client graph. Detect: a new `"use client"` added to a leaf component that is
  only rendered from `page.tsx`. Fix: drop it — it's redundant.
- **REACT-4 (S2) Browser-API capability detection happens in an effect, never during render.**
  `navigator`/`Notification`/`ServiceWorkerRegistration` are undefined during SSR. Detect:
  `grep -rnE "(navigator|Notification|window)\." src --include='*.tsx' | grep -v useEffect`. Fix: move
  into `useEffect`, gate the render on state. The `react-hooks/set-state-in-effect` disable in
  `useNotification.tsx` is the sanctioned exception and carries a comment — **do NOT flag it**.
- **REACT-5 (S2) Shared notification state is consumed via `useNotification()`, never prop-drilled.**
  The hook throws outside its provider. Detect: a component under `src/components/` taking notification
  state as props. Fix: read it from the hook.

## TS — Type discipline

- **TS-1 (S2) No `any`.** Zero occurrences. Payloads get a declared `interface`; caught errors are
  narrowed (`e instanceof Error ? e : new Error(String(e))`). Detect: `grep -rn ": any\|as any" src`.
  Fix: declare the shape, or narrow.
- **TS-2 (S3) `interface` for object shapes, `type` for unions.** `NotificationContextType`,
  `PushPayload` are interfaces; `UnsupportedReason` is a union type. Detect: visual. Fix: match.
- **TS-3 (S2) Imports use the `@/*` alias for cross-directory,** relative only within a directory
  (`./NotificationPush`). Detect: `grep -rn 'from "\.\./' src`. Fix: switch to `@/`.

## ENV — Configuration

- **ENV-1 (S1) Client-readable env vars must be `NEXT_PUBLIC_`-prefixed.** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  is read in browser code; `VAPID_PRIVATE_KEY` and `NOTIFICATION_URL` are server-only and must never gain
  the prefix — that would inline the private key into the client bundle. Detect:
  `grep -rn "process.env" src` and check each against its execution context. Fix: correct the prefix.
- **ENV-2 (S2) Server-side env reads carry a `?? ""` / `?? "/"` fallback;** the browser-side read does
  not. Detect: `grep -rn "process.env" src | grep -v "??"`. Fix: match the neighbour.
- **ENV-3 (S2) Every env var used in code appears in `.env.example`** with a comment explaining it.
  Detect: diff the `process.env.*` names against `.env.example`. Fix: add it.

## DOC — Documentation (sample-repo specific)

- **DOC-1 (S2) README setup instructions must match the actual dependency set and config.** This repo's
  README is a step-by-step tutorial others copy; a stale `npm install` line or config snippet is a real
  defect here. Detect: cross-check README code blocks against `package.json` and `next.config.ts`.
  Fix: update the README in the same change.
- **DOC-2 (S3) Non-obvious workarounds carry a short "why" comment,** not a "what" comment (see the
  `set-state-in-effect` disable and the `isSubscribed` vs `isGranted` note). Detect: visual. Fix: add the
  rationale.

## PWA — Service worker & manifest contracts

- **PWA-1 (S1) `public/notification-sw.js` is hand-written and served verbatim from `public/`.** It is
  not bundled or transpiled, so it must stay plain browser-compatible JS with no imports. Detect:
  `import`/`require`/TS syntax inside `public/*.js`. Fix: revert to plain JS.
- **PWA-2 (S2) The SW payload contract is shared between two files** — the keys `NotificationSender.ts`
  puts in `pushPayload` (`title`, `body`, `icon`, `image`, `url`, `badge`) are exactly the keys
  `public/notification-sw.js` destructures. Detect: diff the two key sets. Fix: change both together.
- **PWA-3 (S2) The manifest is referenced via the `metadata` export,** not a hand-written `<link>` in
  `<head>`. Detect: `grep -rn 'rel="manifest"' src`. Fix: move to `metadata.manifest`.
