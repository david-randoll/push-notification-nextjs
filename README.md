A sample project for push notifications with Next.js. The app used web push notifications to send messages to users. The notification should work on all devices and browsers.

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

Install the below packages.

```bash
npm install web-push next-pwa
```

Skip this step if you are using typescript.

```bash
npm install @types/web-push --save-dev
```

The [next-pwa](https://www.npmjs.com/package/next-pwa) package I am using will genrate a `sw.js` and a `workbox-*.js` file in the public folder. If you have a file with a different name you can 