A sample project for push notifications with Next.js. The app used web push notifications to send messages to users. The
notification should work on all devices and browsers.

**Apple devices need iOS 16.4+ and the site added to the Home Screen.** See
[Platform requirements](#platform-requirements) for the per-browser conditions.

`main` targets **Next.js 16** (App Router, Turbopack, React 19, Tailwind CSS v4). If you are still on an older
Next.js, the **Next.js 14** version of this sample is kept as a reference on the
[`nextjs-14`](https://github.com/david-randoll/push-notification-nextjs/tree/nextjs-14) branch — it uses webpack,
React 18, Tailwind CSS v3 and `next-pwa`.

## Demo

A live demo of the project can be found [here](https://push-notification.davidrandoll.com/)

## Running Locally

First, run the development server:

```bash
npm install
```

Run the below command to generate the vapid keys. Once you have the keys, rename the `.env.example` file to `.env` and
insert the keys.

```bash
web-push generate-vapid-keys --json
```
or
```bash
npx web-push generate-vapid-keys --json
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How it works

The app uses the [web-push](https://www.npmjs.com/package/web-push) package to send push notifications. The app has a
service worker that listens for push events and displays the notification.

Using just this package is enough to send push notifications from most devices and browsers.

However, a few platforms have their own conditions, and none of them report a useful error when
they are not met. The app checks for them up front and shows the user what to do instead of a raw
failure.

## Platform requirements

Everywhere, the page has to be served over HTTPS with a valid certificate (`localhost` is exempt).
Without a secure context the browser does not expose service workers or the Push API at all, so
`http://192.168.x.x` style testing on a phone will look like an unsupported browser. Permission also
has to be requested from inside a real user gesture, which is why `registerAndSubscribe` calls
`Notification.requestPermission()` first, before awaiting the service worker registration — awaiting
anything beforehand ends the gesture and Safari silently suppresses the prompt.

### iPhone and iPad

Apple only exposes the Push API to web apps that have been added to the Home Screen. In an ordinary
Safari tab `window.PushManager` does not exist, so there is nothing to subscribe to and no way to
recover in the tab. Requirements:

-   iOS or iPadOS **16.4 or later**.
-   Added to the Home Screen through Safari's Share menu, and opened from that icon.
-   A `manifest.json` with `"display": "standalone"` and icons (see the PWA section below).

`PlatformDetection.ts` identifies the device and whether the page is running standalone
(`navigator.standalone`, plus the `display-mode` media queries), and the app replaces the subscribe
button with install instructions until that is done. iPadOS 13+ reports a desktop Safari user agent,
so the iPad is identified by `navigator.maxTouchPoints` on a `MacIntel` platform rather than by name.

Two things that surprise people afterwards: deleting the Home Screen icon discards the subscription,
and Focus or Do Not Disturb silences delivery without any signal to the sender.

### Brave

Brave ships the Push API but leaves the transport behind it turned off. Web push on Chromium is
delivered through Google's FCM service, and Brave keeps that opt-in, so `pushManager.subscribe()`
rejects with `Registration failed - push service error` on a site that is otherwise perfectly set up.
The fix is on the user's side:

1. Open `brave://settings/privacy`.
2. Under **Security**, turn on **Use Google services for push messaging**.
3. Relaunch the browser — the setting does not apply until then.

Brave is detected with `navigator.brave.isBrave()`, since its user agent is identical to Chrome's,
and the walkthrough is shown in place of the error when a subscribe attempt fails this way. Other
de-Googled Chromium builds fail identically and usually have an equivalent toggle.

### Safari on macOS

Works in a normal tab from Safari 16.1, no install required. The permission prompt only appears in
response to a click, and macOS notification settings or a Focus mode can suppress the banner after
the browser has accepted the push.

### Chrome, Edge and Firefox

These work out of the box on desktop and Android with nothing beyond HTTPS and VAPID keys. Points
worth knowing:

-   Firefox private windows do not run service workers, so subscribing fails there by design.
-   Android may delay delivery for an app under battery optimisation or Data Saver.
-   On Windows, notifications go through the system notification centre, so Focus Assist and the
    per-app settings under Settings → System → Notifications apply.
-   Permission is stored per origin, so a subscription taken on `localhost` says nothing about the
    deployed domain.

You can read more about the Apple side
[here](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers).

## Security note — read before deploying this

This is a **sample project**, and `POST /api/web-push/send` is deliberately kept as simple as possible:
it takes the whole `subscription` object from the request body and passes it to `web-push`. That is
fine for a demo, but it means the endpoint is **unauthenticated and unthrottled**, and the caller
controls `subscription.endpoint` — the URL the server sends the push to. Consequences you inherit if
you copy this as-is:

-   **Server-side request forgery.** The server will open an HTTPS connection to whatever host the
    caller names, which can be used to probe services reachable from your deployment. (Limited: the
    library is HTTPS-only with TLS verification on, and the response is never returned to the caller.)
-   **Open relay.** Anyone holding a subscription can send it notifications with any title and body.
-   **No timeout or rate limit.** A slow or stalling endpoint holds the request handler open.

Before putting anything like this in production: require authentication, look the subscription up
server-side by user id instead of trusting the body, allowlist the endpoint host against the real push
services (`*.googleapis.com`, `*.mozilla.com`, `*.notify.windows.com`, `*.push.apple.com`), and set a
timeout plus a rate limit.

## Configuration

Install the below packages.

```bash
npm install web-push
```

Skip this step if you are using typescript.

```bash
npm install @types/web-push --save-dev
```

### Setting up the notification

Copy the [notification-sw.js](https://github.com/david-randoll/push-notification-nextjs/blob/main/public/notification-sw.js) file into the `public` folder. This is a service worker that listens for push events and displays the notification.

Copy the files under the [notifications](https://github.com/david-randoll/push-notification-nextjs/tree/main/src/notifications) folder and paste them into your src folder. In my case I pasted them in the
`src/notifications` folder. The `useNotification` hook will be used in the app to subscribe a user and store the
subscription in state. This subscription can be stored in a database and used to send notifications per user.

Take a look at the `page.tsx` file to see how the `useNotification` hook is used. The `page.tsx` calls an endpoint that is found under `src/app/api/web-push/send/route.ts`. This will send the notification to the user.

With this should be able to send notifications now. For Apple devices, you will need to configure the app as a PWA in the next step.

### Configuring as a PWA

On iOS, "PWA" means a web app manifest plus Add to Home Screen — that is all the push flow above needs,
so the remaining work is the manifest and the icons.

> **Note on installability elsewhere.** Chrome and Edge only offer an install prompt
> (`beforeinstallprompt`) for a service worker that handles `fetch`. `public/notification-sw.js`
> deliberately handles only `push` and `notificationclick`, and it is registered on subscribe rather
> than on page load — so this sample is installable on iOS, but not promptable on Android/desktop. If
> you want that, register a service worker on load and give it a `fetch` handler (or add a maintained
> PWA plugin such as [`@serwist/next`](https://serwist.pages.dev)).

I am going to use [pwabuilder](https://www.pwabuilder.com/imageGenerator) to generate the icons for the app. This will generate the different sizes of the icon that are needed for different devices. After going to the site, download the zip file and place the contents into the public folder. You should get 3 folders: android, ios, and windows. Also, an `icons.json` file which we will use for our manifest file.

Move the `icons.json` file to the `public` folder and rename it to `manifest.json`.

```json
{
    "name": "Push Notification Sample",
    "short_name": "Push Notification Sample",
    "description": "A sample project for push notifications with Next.js",
    "theme_color": "#FFFFFF",
    "background_color": "#FFFFFF",
    "start_url": "/",
    "display": "standalone",
    "orientation": "portrait",
    "icons": // the icons will be here
}
```

Reference the `manifest.json` file from the `metadata` export in `layout.tsx`. Next.js renders the
`<link rel="manifest">` tag for you.

```tsx
export const metadata: Metadata = {
    title: "Push Notification Sample",
    description: "...",
    manifest: "/manifest.json",
    icons: {
        icon: "/logo.svg",
    },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
                <NotificationProvider>{children}</NotificationProvider>
            </body>
        </html>
    );
}
```

That is all that is required. `next.config.ts` only needs the standalone output used by the Dockerfile.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
};

export default nextConfig;
```
