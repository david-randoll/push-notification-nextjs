import Image from "next/image";
import React from "react";

/**
 * Shown on iPhone and iPad while the page is still an ordinary Safari tab. Apple gates the
 * Push API behind Add to Home Screen, so installing is a prerequisite rather than a
 * suggestion, and the subscribe button stays hidden until it is done.
 */
export const IosInstallGuide = () => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
            <h1 className="text-2xl font-bold mb-2 text-center">Add to Home Screen first</h1>
            <p className="text-gray-700 text-center mb-4">
                On iPhone and iPad, notifications only work once this site has been installed as an
                app. It takes a few taps:
            </p>

            <ol className="list-decimal list-inside text-sm text-gray-800 space-y-2 mb-4">
                <li>
                    Open this page in <span className="font-semibold">Safari</span> (other iOS
                    browsers cannot install it).
                </li>
                <li>
                    Tap the <span className="font-semibold">Share</span> button &mdash; the square
                    with an arrow pointing up.
                </li>
                <li>
                    Choose <span className="font-semibold">Add to Home Screen</span>, then
                    tap <span className="font-semibold">Add</span>.
                </li>
                <li>
                    Open the new icon from your Home Screen and subscribe from there.
                </li>
            </ol>

            <p className="text-xs text-gray-500 mb-4">
                Requires iOS or iPadOS 16.4 or later. Notifications will not appear while the device
                is in Focus or Do Not Disturb.
            </p>

            <Image
                src="/ios-pwa/pwa_ios.jpg"
                width={10000}
                height={10000}
                alt="Adding the app to the iOS Home Screen from the Safari share sheet"
                className="h-auto w-auto rounded"
            />
        </div>
    );
};
