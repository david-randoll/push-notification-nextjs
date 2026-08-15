const SERVICE_WORKER_FILE_PATH = "./notification-sw.js";

export function isNotificationSupported(): boolean {
    let unsupported = false;
    if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("showNotification" in ServiceWorkerRegistration.prototype)
    ) {
        unsupported = true;
    }
    return !unsupported;
}

export type UnsupportedReason = "insecure-context" | "unsupported-browser";

/**
 * Service workers and the Push API are only exposed in a secure context: HTTPS, or the
 * localhost exemption. Over plain HTTP (e.g. hitting a LAN IP like http://192.168.x.x)
 * the APIs are absent entirely, which is indistinguishable from an old browser unless we
 * check the context first. Returns null when push is supported.
 */
export function getUnsupportedReason(): UnsupportedReason | null {
    if (isNotificationSupported()) return null;
    return window.isSecureContext ? "unsupported-browser" : "insecure-context";
}

export function isPermissionGranted(): boolean {
    return Notification.permission === "granted";
}

export function isPermissionDenied(): boolean {
    return Notification.permission === "denied";
}

export async function registerAndSubscribe(onSubscribe: (subs: PushSubscription | null) => void,
                                           onError: (e: Error) => void): Promise<void> {
    try {
        await navigator.serviceWorker.register(SERVICE_WORKER_FILE_PATH);
        //subscribe to notification
        navigator.serviceWorker.ready
            .then((registration: ServiceWorkerRegistration) => {
                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                });
            })
            .then((subscription: PushSubscription) => {
                console.info("Created subscription Object: ", subscription.toJSON());
                onSubscribe(subscription);
            })
            .catch((e) => {
                onError(e);
            });
    } catch (e) {
        onError(e instanceof Error ? e : new Error(String(e)));
    }
}