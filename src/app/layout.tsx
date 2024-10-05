import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/notifications/useNotification";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmPlexSerif = IBM_Plex_Serif({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-ibm-plex-serif",
});

export const metadata: Metadata = {
    title: "Push Notification Sample",
    description:
        "A sample project for push notifications with Next.js. The app used web push notifications to send messages to users.",
    icons: {
        icon: "/logo.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
                <NotificationProvider>{children}</NotificationProvider>
            </body>
        </html>
    );
}
