import { checkPermissionStateAndAct, notificationUnsupported, registerAndSubscribe } from "./NotificationPush";
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";

interface NotificationContextType {
    isSupported: boolean;
    setIsSupported: React.Dispatch<React.SetStateAction<boolean>>;
    isSubscribed: boolean;
    setIsSubscribed: React.Dispatch<React.SetStateAction<boolean>>;
    subscription: PushSubscription | null;
    setSubscription: React.Dispatch<React.SetStateAction<PushSubscription | null>>;
    handleSubscribe: () => void;
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

    const contextValue = useMemo(
        () => ({
            isSupported,
            setIsSupported,
            isSubscribed,
            setIsSubscribed,
            subscription,
            setSubscription,
            handleSubscribe,
        }),
        [isSupported, setIsSupported, isSubscribed, setIsSubscribed, subscription, setSubscription, handleSubscribe]
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
