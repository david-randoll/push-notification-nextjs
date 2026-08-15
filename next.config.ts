import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    // Next blocks cross-origin requests to dev resources (including HMR) by default, so
    // hitting the dev server from another device on the LAN breaks live reload. Set
    // DEV_ORIGIN to this machine's LAN address (e.g. DEV_ORIGIN=192.168.1.238) to allow it.
    // Dev-only; it has no effect on a production build.
    allowedDevOrigins: process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : [],
};

export default nextConfig;
