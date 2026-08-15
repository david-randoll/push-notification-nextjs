import React, {useState} from "react";
import {useNotification} from "@/notifications/useNotification";

export const NotificationSubscriptionForm = () => {
    const {subscription} = useNotification();

    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");
    const [sendError, setSendError] = useState<string | null>(null);

    const sendNotification = async () => {
        setSendError(null);
        const response = await fetch("/api/web-push/send", {
            method: "POST",
            body: JSON.stringify({title, message, subscription}),
            headers: {
                "Content-Type": "application/json",
            },
        });

        // The route now reports real failures, so keep the user's text on error instead of
        // clearing the form as though the notification had gone out.
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            setSendError(body?.message ?? "Failed to send push notification.");
            return;
        }

        setMessage("");
        setTitle("");
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Send a Notification</h2>

            {sendError && (
                <p className="text-red-600 mb-4">{sendError}</p>
            )}

            {/* Title Input */}
            <input
                type="text"
                placeholder="Notification Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
            />

            {/* Message Input */}
            <textarea
                placeholder="Notification Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
            />

            <button onClick={() => sendNotification()}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition">
                Send Notification
            </button>
        </div>
    );
};