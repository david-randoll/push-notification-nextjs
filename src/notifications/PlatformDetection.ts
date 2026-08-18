/**
 * Platform quirks that decide whether subscribing can work at all.
 *
 * The big one is Apple: iOS and iPadOS expose the Push API only to web apps that have been
 * added to the Home Screen. In a normal Safari tab `window.PushManager` simply does not
 * exist, which is indistinguishable from an ancient browser unless the device is
 * identified first.
 */

interface StandaloneNavigator extends Navigator {
    /** Non-standard Safari flag, set when the page is running as a Home Screen web app. */
    standalone?: boolean;
}

export function isIosDevice(): boolean {
    // iPadOS 13+ reports a desktop Safari user agent, so the iPad only gives itself away
    // through the touch point count on an otherwise "Mac" platform.
    const isIpadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || isIpadOs;
}

/** True when the page is running as an installed app rather than inside a browser tab. */
export function isStandalone(): boolean {
    const navigatorStandalone = (navigator as StandaloneNavigator).standalone;
    return (
        navigatorStandalone === true ||
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches
    );
}

/**
 * Apple requires the Home Screen install before push is available, so a plain Safari tab
 * on an iPhone or iPad should be sent to the install instructions rather than a subscribe
 * button that cannot succeed.
 */
export function requiresHomeScreenInstall(): boolean {
    return isIosDevice() && !isStandalone();
}
