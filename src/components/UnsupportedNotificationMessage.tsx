import Image from "next/image";
import React from "react";
import {useNotification} from "@/notifications/useNotification";

export const UnsupportedNotificationMessage = () => {
    const {unsupportedReason} = useNotification();

    // Served over plain HTTP (a LAN IP, say). The browser is perfectly capable, it just
    // withholds service workers and the Push API outside a secure context, so pointing the
    // user at their browser would send them down the wrong path.
    if (unsupportedReason === "insecure-context") {
        return (
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Push Notification Subscription</h1>
                <p className="text-red-500 text-center mb-3">
                    Push notifications require a secure connection.
                </p>
                <p className="text-gray-600 text-center text-sm">
                    This page is being served over <span className="font-mono">http://</span>, and browsers only
                    expose service workers and the Push API over <span className="font-mono">https://</span> (or
                    on <span className="font-mono">localhost</span>). Open this page over HTTPS to subscribe.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 w-full max-w-md">
            <p className="text-red-500 text-center mb-6">Push notifications are not supported in this browser.
                Consider adding to the home screen (PWA) if on iOS.</p>
            <Image src="/ios-pwa/pwa_ios.jpg" width={10000} height={10000} alt="Push Notification"
                   className="h-auto w-auto"/>
        </div>
    );
};
