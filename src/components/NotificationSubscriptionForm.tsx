import React, {useState} from "react";
import {useNotification} from "@/notifications/useNotification";

export const NotificationSubscriptionForm = () => {
    const {subscription} = useNotification();

    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");

    const sendNotification = async () => {
        await fetch("/api/web-push/send", {
            method: "POST",
            body: JSON.stringify({title, message, subscription}),
            headers: {
                "Content-Type": "application/json",
            },
        });
        setMessage("");
        setTitle("");
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Send a Notification</h2>

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