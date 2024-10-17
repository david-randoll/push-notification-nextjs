const SERVICE_WORKER_FILE_PATH = "./notification-sw.js";

export function notificationUnsupported(): boolean {
    let unsupported = false;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("showNotification" in ServiceWorkerRegistration.prototype)) {
        unsupported = true;
    }
    return unsupported;
}

export function checkPermissionStateAndAct(onSubscribe: (subs: PushSubscription | null) => void): void {
    const state: NotificationPermission = Notification.permission;
    switch (state) {
        case "denied":
            break;
        case "granted":
            registerAndSubscribe(onSubscribe);
            break;
        case "default":
            break;
    }
}

export async function registerAndSubscribe(onSubscribe: (subs: PushSubscription | null) => void): Promise<void> {
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
                console.error("Failed to subscribe cause of: ", e);
            });
    } catch (e) {
        console.error("Failed to register service-worker: ", e);
    }
}

export async function unsubscribe(onUnsubscribe: () => void): Promise<void> {
    navigator.serviceWorker.ready
        .then((reg) => {
            reg.pushManager.getSubscription().then((subscription) => {
                if (!subscription) {
                    console.error("No subscription found");
                    return;
                }
                subscription
                    .unsubscribe()
                    .then((successful) => {
                        onUnsubscribe();
                    })
                    .catch((e) => {
                        console.error("Failed to unsubscribe cause of: ", e);
                    });
            });
        })
        .catch((e) => {
            console.error("Failed to get service-worker registration: ", e);
        });
}
