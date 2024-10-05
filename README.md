A sample project for push notifications with Next.js. The app used web push notifications to send messages to users. The
notification should work on all devices and browsers.

**Require IOS 16+ for Apple devices.**

## Demo

A live demo of the project can be found [here](https://push-notification.davidrandoll.com/)

## Running Locally

First, run the development server:

```bash
npm install
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How it works

The app uses the [web-push](https://www.npmjs.com/package/web-push) package to send push notifications. The app has a
service worker that listens for push events and displays the notification.

Using just this package is enough to send push notifications from most devices and browsers.

For notifications to work on Apple devices, there are a few extra steps. You can read more about it here
[here](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers).

-   The app must be served over HTTPS with a valid SSL certificate.
-   The app must be a PWA (Progressive Web App).

## Configuration

Install the below packages.

```bash
npm install web-push next-pwa
```

Skip this step if you are using typescript.

```bash
npm install @types/web-push --save-dev
```

### Setting up the notification

Copy the [notification-sw.js](https://github.com/david-randoll/push-notification-nextjs/blob/main/public/notification-sw.js) file into the `public` folder. This is a service worker that listens for push events and displays the notification.

Copy the 

### Configuring as a PWA

The [next-pwa](https://www.npmjs.com/package/next-pwa) package will generate a `sw-pwa.js` and a `workbox-*.js` file in
the public folder.
