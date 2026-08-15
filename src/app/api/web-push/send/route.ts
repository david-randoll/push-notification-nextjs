import { sendNotification } from "@/notifications/NotificationSender";
import { NextRequest } from "next/server";
import { WebPushError } from "web-push";

export async function POST(req: NextRequest) {
    const { subscription, title, message } = await req.json();

    try {
        await sendNotification(subscription, title, message);
    } catch (error) {
        console.error("Error sending notification", error);

        // 404/410 from the push service means the subscription is dead (unsubscribed, or the
        // browser rotated it). The client should drop it and re-subscribe rather than retry.
        if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
            return Response.json(
                { message: "Subscription is no longer valid. Please subscribe again." },
                { status: 410 }
            );
        }

        return Response.json({ message: "Failed to send push notification." }, { status: 502 });
    }

    return Response.json({ message: "Push sent." });
}
