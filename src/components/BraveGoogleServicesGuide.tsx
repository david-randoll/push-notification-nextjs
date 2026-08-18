import React, {useState} from "react";

const SETTINGS_URL = "brave://settings/privacy";

/**
 * Walkthrough for Brave's "Use Google services for push messaging" setting.
 *
 * Note: brave:// URLs cannot be navigated to from a web page (the browser blocks it), so
 * the address is offered as copyable text rather than a link that would silently do
 * nothing when clicked.
 */
export const BraveGoogleServicesGuide = ({onRetry}: { onRetry: () => void }) => {
    const [copied, setCopied] = useState(false);

    const copySettingsUrl = async () => {
        try {
            await navigator.clipboard.writeText(SETTINGS_URL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard access can be denied; the address is on screen either way.
            setCopied(false);
        }
    };

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 text-left">
            <h2 className="font-bold text-orange-900 mb-2">
                Brave blocks push notifications by default
            </h2>
            <p className="text-sm text-orange-900 mb-3">
                Brave supports web push, but the delivery service it relies on is turned off until
                you enable it. Turning it on takes about 30 seconds:
            </p>

            <ol className="list-decimal list-inside text-sm text-orange-900 space-y-2 mb-3">
                <li>
                    Open a new tab and go to:
                    <div className="flex items-center gap-2 mt-1">
                        <code className="bg-white border border-orange-200 rounded px-2 py-1 font-mono text-xs">
                            {SETTINGS_URL}
                        </code>
                        <button
                            onClick={copySettingsUrl}
                            className="text-xs bg-orange-500 text-white rounded px-2 py-1 hover:bg-orange-600 transition"
                            type="button"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </li>
                <li>
                    Scroll to <span className="font-semibold">Security</span> and turn on{" "}
                    <span className="font-semibold">Use Google services for push messaging</span>.
                    <span className="block text-xs mt-1">
                        On some versions this lives under
                        {" "}<span className="font-mono">brave://settings/privacy</span> &rarr;{" "}
                        <span className="font-semibold">Privacy and security</span>, and it may be
                        worded <span className="font-semibold">&ldquo;Use Google services for
                        push messaging&rdquo;</span> or{" "}
                        <span className="font-semibold">&ldquo;Google services for push
                        messaging&rdquo;</span>.
                    </span>
                </li>
                <li>
                    Relaunch Brave when it prompts you &mdash; the setting only takes effect after a
                    restart.
                </li>
                <li>Come back to this page and subscribe again.</li>
            </ol>

            <p className="text-xs text-orange-800 mb-3">
                Brave routes push messages through Google&rsquo;s service, so enabling this shares
                push delivery data with Google. Brave keeps it opt-in for that reason.
            </p>

            <button
                onClick={onRetry}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
                type="button"
            >
                I&rsquo;ve enabled it &mdash; try again
            </button>
        </div>
    );
};
