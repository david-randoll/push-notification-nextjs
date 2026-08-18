"use client";
import {useNotification} from "@/notifications/useNotification";
import React from "react";
import {NotificationSubscriptionForm} from "@/components/NotificationSubscriptionForm";
import {UnsupportedNotificationMessage} from "@/components/UnsupportedNotificationMessage";
import NotificationSubscriptionStatus from "@/components/NotificationSubscriptionStatus";
import {IosInstallGuide} from "@/components/IosInstallGuide";

const Home = () => {
    const {isSupported, isSubscribed, requiresInstall} = useNotification();

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100dvh)] bg-gray-100 p-4">
            {/* The install check comes first: on iOS the Push API is missing until the app
                is on the Home Screen, so "unsupported" there is really "not installed yet". */}
            {requiresInstall ? (
                <IosInstallGuide/>
            ) : !isSupported ? (
                <UnsupportedNotificationMessage/>
            ) : (
                <NotificationSubscriptionStatus/>
            )}

            {isSubscribed && (
                <NotificationSubscriptionForm/>
            )}
        </div>
    );
};

export default Home;
