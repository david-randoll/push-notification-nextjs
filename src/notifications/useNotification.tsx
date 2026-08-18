"use client";
import {
    getUnsupportedReason,
    isNotificationSupported,
    isPermissionDenied,
    isPermissionGranted,
    registerAndSubscribe,
    UnsupportedReason
} from "./NotificationPush";
import {isBraveBrowser} from "./BrowserDetection";
import {requiresHomeScreenInstall} from "./PlatformDetection";
import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";

interface NotificationContextType {
    isSupported: boolean;
    isBrave: boolean;
    requiresInstall: boolean;
    unsupportedReason: UnsupportedReason | null;
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
    const [isBrave, setIsBrave] = useState<boolean>(false);
    const [requiresInstall, setRequiresInstall] = useState<boolean>(false);
    const [unsupportedReason, setUnsupportedReason] = useState<UnsupportedReason | null>(null);
    const [isGranted, setIsGranted] = useState<boolean>(false);
    const [isDenied, setIsDenied] = useState<boolean>(false);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubscribe = () => {
        // Clear any error from a previous attempt, otherwise a retry that succeeds still
        // renders the stale "Error: ..." line next to "You are subscribed!".
        setErrorMessage(null);
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

    // The notification/service-worker APIs only exist in the browser, so capability
    // detection has to happen after mount rather than during render.
    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        setUnsupportedReason(getUnsupportedReason());
        // Apple exposes push only to installed Home Screen apps, so a Safari tab on iOS
        // needs the install instructions rather than a subscribe button that cannot work.
        setRequiresInstall(requiresHomeScreenInstall());
        // Brave keeps the push transport disabled by default, so knowing we're on Brave
        // lets a failed subscribe point at the setting instead of a bare error.
        isBraveBrowser().then(setIsBrave);
        if (isNotificationSupported()) {
            setIsSupported(true);
            const granted = isPermissionGranted();
            setIsGranted(granted);
            setIsDenied(isPermissionDenied());
            if (granted) {
                handleSubscribe();
            }
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, []);

    const contextValue = useMemo(
        () => ({
            isSupported,
            isBrave,
            requiresInstall,
            unsupportedReason,
            isSubscribed,
            isGranted,
            isDenied,
            subscription,
            errorMessage,
            handleSubscribe,
        }),
        [isSupported, isBrave, requiresInstall, unsupportedReason, isSubscribed, isGranted, isDenied, subscription, errorMessage]
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
