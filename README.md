A sample project for push notifications with Next.js. The app used web push notifications to send messages to users. The
notification should work on all devices and browsers.

**Require IOS 16+ for Apple devices.**

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

However, on Apple devices, there are a few extra things we have to do.

-   The app must be served over HTTPS with a valid SSL certificate.
-   The app must be a PWA (Progressive Web App).

You can read more about it [here](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers).

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

A PWA needs two things: a web app manifest, and a service worker. The service worker is already covered by
`public/notification-sw.js` from the previous step, so all that is left is the manifest and the icons.

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
