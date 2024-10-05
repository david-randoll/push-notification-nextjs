"use client";
import { useNotification } from "@/notifications/useNotification";
import React, { useState } from "react";

const Home = () => {
    const { isSupported, isSubscribed, handleSubscribe, subscription } = useNotification();

    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");

    const sendNotification = async () => {
        await fetch("/api/web-push/send", {
            method: "POST",
            body: JSON.stringify({ title, message, subscription }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        setMessage("");
        setTitle("");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100dvh)] bg-gray-100 p-4">
            {/* Notification Subscription Section */}
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Push Notification Subscription</h1>
                {isSupported ? (
                    <div>
                        {!isSubscribed ? (
                            <button
                                onClick={handleSubscribe}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
                                Subscribe to Push Notifications
                            </button>
                        ) : (
                            <div className="text-center">
                                <p className="text-green-600 font-semibold">You are subscribed!</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-red-500 text-center">Push notifications are not supported in this browser.</p>
                )}
            </div>

            {/* Form Section */}
            {isSubscribed && (
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

                    <button
                        onClick={() => sendNotification()}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition">
                        Send Notification
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
