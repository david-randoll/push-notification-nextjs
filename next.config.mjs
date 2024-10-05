/** @type {import('next').NextConfig} */

import withPWA from "next-pwa";

const pwaConfig = withPWA({
    dest: "public",
    sw: "sw-pwa.js",
});

export default {
    ...pwaConfig,
    output: "standalone",
};
