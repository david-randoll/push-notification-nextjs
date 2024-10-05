self.addEventListener("install", () => {
    console.info("service worker installed.");
});

const sendDeliveryReportAction = () => {
    console.log("Web push delivered.");
};

self.addEventListener("push", function (event) {
    if (!event.data) {
        return;
    }

    const payload = event.data.json();
    const { body, icon, image, badge, url, title } = payload;
    const notificationTitle = title ?? "Unknown title";
    const notificationOptions = {
        body,
        icon,
        image,
        data: {
            url,
        },
        badge,
    };

    event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions).then(() => {
            sendDeliveryReportAction();
        })
    );
});

self.addEventListener("notificationclick", function (event) {
    console.log("Notification clicked.");
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            const url = event.notification.data.url;

            if (!url) return;

            for (const client of clientList) {
                if (client.url === url && "focus" in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                console.log("Opening window.");
                return clients.openWindow(url);
            }
        })
    );
});
