"use client";
import { checkPermissionStateAndAct, notificationUnsupported, registerAndSubscribe, unsubscribe } from "./NotificationPush";
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";

interface NotificationContextType {
    isSupported: boolean;
    setIsSupported: React.Dispatch<React.SetStateAction<boolean>>;
    isSubscribed: boolean;
    setIsSubscribed: React.Dispatch<React.SetStateAction<boolean>>;
    subscription: PushSubscription | null;
    setSubscription: React.Dispatch<React.SetStateAction<PushSubscription | null>>;
    handleSubscribe: () => void;
    handleUnsubscribe: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    useEffect(() => {
        if (!notificationUnsupported()) {
            setIsSupported(true);
            checkPermissionStateAndAct((subscription) => {
                if (subscription) {
                    setIsSubscribed(true);
                    setSubscription(subscription);
                }
            });
        }
    }, []);

    const handleSubscribe = () => {
        registerAndSubscribe((subscription) => {
            if (subscription) {
                // for a production app, you would probably have a user account and save the subscription to the user
                // make http request to save the subscription
                setIsSubscribed(true);
                setSubscription(subscription);
            }
        });
    };

    const handleUnsubscribe = () => {
        unsubscribe(() => {
            // for a production app, you would probably have a user account and delete the subscription from the user
            // make http request to delete the subscription
            setIsSubscribed(false);
            setSubscription(null);
            console.log("Unsubscribed from push notifications");
        });
    };

    const contextValue = useMemo(
        () => ({
            isSupported,
            setIsSupported,
            isSubscribed,
            setIsSubscribed,
            subscription,
            setSubscription,
            handleSubscribe,
            handleUnsubscribe,
        }),
        [isSupported, setIsSupported, isSubscribed, setIsSubscribed, subscription, setSubscription, handleSubscribe, handleUnsubscribe]
    );

    return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};
