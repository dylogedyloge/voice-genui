import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // domains: ["api.atripa.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.atripa.ir",
        port: "",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "cdn-a-hi.partocrs.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.atripa.com",
        port: "",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
