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
                submitSubscription(subscription).then((_) => {
                    onSubscribe(subscription);
                });
            })
            .catch((e) => {
                console.error("Failed to subscribe cause of: ", e);
            });
    } catch (e) {
        console.error("Failed to register service-worker: ", e);
    }
}

async function submitSubscription(subscription: PushSubscription): Promise<void> {
    const res = await fetch("/api/web-push/subscription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription }),
    });
    const result = await res.json();
    console.log(result);
}
