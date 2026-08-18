/**
 * Brave ships the Push API but keeps the underlying transport (Google's FCM endpoint,
 * which is what web-push talks to) switched off by default. With it off, the
 * pushManager.subscribe() call rejects with "Registration failed - push service error",
 * which looks like a broken site rather than a browser setting the user has to flip.
 * Detecting Brave lets us show the fix instead of a bare error string.
 */

interface BraveNavigator extends Navigator {
    brave?: {
        isBrave: () => Promise<boolean>;
    };
}

export async function isBraveBrowser(): Promise<boolean> {
    const brave = (navigator as BraveNavigator).brave;
    if (!brave?.isBrave) return false;
    try {
        return await brave.isBrave();
    } catch {
        return false;
    }
}

/**
 * Brave surfaces the disabled push service as an AbortError with this text. Other
 * failures (bad VAPID key, no network) are unrelated to the Google services toggle, so
 * only the push-service wording should send the user to the settings walkthrough.
 */
export function isPushServiceError(errorMessage: string | null): boolean {
    if (!errorMessage) return false;
    return /push service error|Registration failed/i.test(errorMessage);
}
