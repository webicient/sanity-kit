import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "cdn.sanity.io" }],
  },
};

export default createNextIntlPlugin()(nextConfig);
