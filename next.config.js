/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
    dest: "public",
    sw: "sw-pwa.js",
});

module.exports = withPWA({
    output: "standalone",
});