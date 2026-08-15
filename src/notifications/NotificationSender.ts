import webpush, { PushSubscription } from "web-push";

webpush.setVapidDetails(
    "mailto:blog@davidrandoll.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
    process.env.VAPID_PRIVATE_KEY ?? ""
);

interface PushPayload {
    title: string;
    body: string;
    image?: string;
    icon: string;
    url: string;
    badge: string;
}

export const sendNotification = async (subscription: PushSubscription, title: string, message: string) => {
    const pushPayload: PushPayload = {
        title: title,
        body: message,
        //image: "/logo.png", if you want to add an image
        icon: "/user.png",
        url: process.env.NOTIFICATION_URL ?? "/",
        badge: "/logo.svg",
    };

    // Must be awaited: without it the route responds (and, on a serverless host, the
    // invocation can be torn down) before the push has actually been delivered.
    // Errors deliberately propagate so the route can report the real outcome rather than
    // reporting success for a push the push service rejected.
    await webpush.sendNotification(subscription, JSON.stringify(pushPayload));
};
