import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.7'],
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "**.ak.sv",
      },
      {
        protocol: "https",
        hostname: "ak.sv",
      },
      {
        protocol: "https",
        hostname: "**.akwam.io",
      },
      {
        protocol: "https",
        hostname: "akwam.io",
      },
      {
        protocol: "https",
        hostname: "img.downet.net",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
