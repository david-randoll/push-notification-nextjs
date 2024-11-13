"use client";
import {
    isNotificationSupported,
    isPermissionDenied,
    isPermissionGranted,
    registerAndSubscribe
} from "./NotificationPush";
import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";

interface NotificationContextType {
    isSupported: boolean;
    isSubscribed: boolean;
    isGranted: boolean;
    isDenied: boolean;
    subscription: PushSubscription | null;
    errorMessage: string | null;
    handleSubscribe: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [isGranted, setIsGranted] = useState<boolean>(false);
    const [isDenied, setIsDenied] = useState<boolean>(false);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isNotificationSupported()) {
            setIsSupported(true);
            const granted = isPermissionGranted();
            setIsGranted(granted);
            setIsDenied(isPermissionDenied());
            if (granted) {
                handleSubscribe();
            }
        }
    }, []);

    const handleSubscribe = () => {
        const onSubscribe = (subscription: PushSubscription | null) => {
            if (subscription) {
                // for a production app, you would probably have a user account and save the subscription to the user
                // make http request to save the subscription
                setIsSubscribed(true);
                setSubscription(subscription);
            }
            setIsGranted(isPermissionGranted());
            setIsDenied(isPermissionDenied());
        };
        const onError = (e: Error) => {
            console.error("Failed to subscribe cause of: ", e);
            setIsGranted(isPermissionGranted());
            setIsDenied(isPermissionDenied());
            setIsSubscribed(false);
            setErrorMessage(e?.message);
        }
        registerAndSubscribe(onSubscribe, onError);
    };

    const contextValue = useMemo(
        () => ({
            isSupported,
            isSubscribed,
            isGranted,
            isDenied,
            subscription,
            errorMessage,
            handleSubscribe,
        }),
        [isSupported, isSubscribed, isGranted, isDenied, subscription, errorMessage]
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
