# push-notification-nextjs Threat Model

Repo-specific attack surface, derived from the code. Each entry: threat · where · detect · fix ·
severity. The code is the source of truth; if a surface changed, update the entry.

**Trust model — this sets every severity.** The app has exactly **one** server entry point,
`POST /api/web-push/send` (`src/app/api/web-push/send/route.ts`), and it is **unauthenticated,
unvalidated and unthrottled**. There is no login, no session, no tenancy, no CSRF token, and no rate
limit anywhere in the repo. The README advertises a **publicly deployed instance**
(`push-notification.davidrandoll.com`), so the hostile model applies: assume an anonymous internet
attacker can call this endpoint arbitrarily often with a fully attacker-controlled JSON body.

The body is destructured as `{ subscription, title, message }` and passed straight into
`webpush.sendNotification(subscription, ...)`. **`subscription.endpoint` is a URL the attacker
controls**, and `web-push` issues an outbound HTTPS POST to it. That single fact drives SSRF-1, RELAY-1
and DOS-1 below.

Scope note: this is a **sample/reference project**. Several findings are arguably "inherent to the
demo" — but the deployed instance is a real server on the real internet, so they are still real. Each
entry records the demo-vs-production tension explicitly rather than hand-waving it.

## SSRF — Outbound request forgery

- **SSRF-1 (High) Attacker-controlled push endpoint drives server-side requests.**
  threat: an anonymous caller supplies `subscription.endpoint` and makes the server open a TLS
  connection to any host:port they choose — internal service discovery, port/host reachability probing
  from inside the deployment's network boundary, and hitting internal HTTPS APIs that trust the app's
  source IP.
  where: `src/app/api/web-push/send/route.ts:5` → `src/notifications/NotificationSender.ts` →
  `webpush.sendNotification`.
  **Status: CONFIRMED** by local proof — `POST` with `endpoint: https://127.0.0.1:9998/ssrf-proof`
  produced a logged TCP connect from the server plus a TLS ClientHello (`160301...`).
  Real constraints that cap the impact (verified, not assumed): `web-push` speaks **HTTPS only**
  (a plain `http://` endpoint dies with `EPROTO` before sending), TLS verification is **on** by default
  so the target needs a valid chain for the request to complete, and it is **blind** — the response body
  never reaches the attacker. So `http://169.254.169.254` cloud-metadata is *not* reachable; internal
  HTTPS services and connect/timing oracles are.
  Detect: `grep -n "subscription" src/app/api/web-push/send/route.ts` — is the endpoint host validated
  before use?
  Fix: allowlist the endpoint host against the known push services (`*.googleapis.com`,
  `*.mozilla.com`, `*.notify.windows.com`, `*.push.apple.com`), reject anything else, and re-resolve to
  block private/loopback/link-local ranges.

## RELAY — Abuse of the send endpoint

- **RELAY-1 (Medium) Unauthenticated open push relay.** threat: anyone who learns a victim's push
  subscription can send them unlimited notifications with fully attacker-chosen `title`/`message`,
  branded as this app. Phishing/harassment vector; it is also the app's own advertised behaviour.
  where: `route.ts` — no auth check, no ownership check binding a subscription to a caller.
  Detect: `grep -nE "auth|session|token|getServerSession" src/app/api/web-push/send/route.ts` → empty.
  Fix: for a demo, bind the subscription server-side to a session/cookie rather than accepting it in the
  body; for production, require auth and look the subscription up by user id.
- **RELAY-2 (Low) `title`/`message` are unvalidated and untyped.** threat: no length or type check
  before encryption; `web-push` caps payloads (~4 KB) so oversized input errors rather than exploding,
  and the values are rendered by `showNotification` (text, not HTML) so there is no XSS sink.
  where: `route.ts:5`. Detect: no `zod`/manual validation present. Fix: validate shape and cap lengths.

## DOS — Resource exhaustion

- **DOS-1 (Medium) No timeout on the outbound push request, and no rate limit.** threat: an attacker
  points `endpoint` at a host that accepts the TCP/TLS connection then stalls; because
  `sendNotification` is now correctly `await`ed, the route handler blocks for the full duration. Repeat
  concurrently to exhaust server connections/handlers.
  **Status: CONFIRMED incidentally** — during the SSRF proof a single request against a non-responding
  TLS listener hung the client for >2 minutes with no server-side timeout.
  where: `NotificationSender.ts` — `webpush.sendNotification` called with no `timeout` option.
  Note the honest tension: pre-`await` this endpoint returned instantly (and lied about success);
  awaiting is correct but converts a silent-failure bug into a blocking one. Both want a timeout.
  Detect: `grep -n "timeout" src/notifications/NotificationSender.ts` → absent.
  Fix: pass `{ timeout: 5000 }` (or an `AbortSignal`), and rate-limit the route per IP.

## SEC — Secrets & configuration

- **SEC-1 (Info, currently clean) VAPID private key must stay server-only.**
  `VAPID_PRIVATE_KEY` and `NOTIFICATION_URL` are read without the `NEXT_PUBLIC_` prefix and only in
  `NotificationSender.ts`, which is imported solely by the route handler — server bundle only.
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is public by design (it ships in the client bundle, which is correct
  for an applicationServerKey). Verified: `.env` is untracked; only `.env.example` (empty values) is
  committed.
  Detect: `grep -rn "NEXT_PUBLIC_" src` — any hit naming a *private* key is Critical.
  Fix: never prefix the private key; rotate immediately if it ever ships client-side.
- **SEC-2 (Low) The route reports success unconditionally.** `route.ts` returns
  `{"message":"Push sent."}` with 200 even when `webpush.sendNotification` rejects (expired/410
  subscription, invalid keys, SSRF target refusing). Not exploitable, but it hides real failures and
  makes abuse harder to detect. where: `route.ts:7`. Fix: propagate the outcome and log/alert failures.

## DEP — Dependencies

- **DEP-1 (clean) No scanner is configured** (no `audit`/`snyk` script, no CI — there is no `.github/`
  directory at all). Run `npm audit` manually. Current state: **0 vulnerabilities** (prod and dev) on
  next 16.3.1 / react 19.2.8 / web-push 3.6.7. The previous Next 14 + `next-pwa` tree had 23 findings
  (15 high); GitHub still reports 101 on the `main` branch.
  Fix: add `npm audit --audit-level=high` to a CI workflow.

## Not applicable to this repo (checked, absent)

No SQL/ORM, no database, no `child_process`/`exec`/`eval`/`new Function`, no filesystem reads from user
input, no deserialization beyond `req.json()`, no file upload, no multi-tenancy, no auth system to
bypass. `public/notification-sw.js` renders push payloads via `showNotification` (text fields, no HTML
sink). Do not manufacture findings in these categories.

## Severity → ship decision

Critical/High → 🔴 blocker; Medium → 🟡 sign-off; Low/Info → 🟡 noted.

## Catastrophic invariants (re-verify every ship, diff or no diff)

- `VAPID_PRIVATE_KEY` never reaches the client bundle and is never `NEXT_PUBLIC_`-prefixed.
- `.env` is never committed; `.env.example` carries empty placeholders only.
- `subscription.endpoint` is never passed to an outbound client without host validation (SSRF-1).
- The send route never gains a sink that reflects attacker input as HTML/JS.
- `npm audit` reports 0 high/critical before ship.
