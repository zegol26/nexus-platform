import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.16"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nexustalenta.com",
        pathname: "/front/assets/images/**",
      },
    ],
  },
};

export default nextConfig;
