import React from "react";
import {useNotification} from "@/notifications/useNotification";

const NotificationSubscriptionStatus = () => {
    const {isSubscribed, handleSubscribe, isGranted, isDenied, errorMessage} = useNotification();

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Push Notification Subscription</h1>

            {isDenied && (
                <p className="text-red-600 text-center mb-4">
                    You have denied permission for push notifications. To enable, please update your browser settings.
                </p>
            )}

            {errorMessage && (
                <p className="text-red-600 text-center mb-4">
                    Error: {errorMessage}
                </p>
            )}

            <div>
                {!isSubscribed && (
                    <button
                        onClick={handleSubscribe}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                        disabled={isDenied}
                    >
                        Subscribe to Push Notifications
                    </button>
                )}

                {isGranted && (
                    <div className="text-center">
                        <p className="text-green-600 font-semibold">You are subscribed!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationSubscriptionStatus;
