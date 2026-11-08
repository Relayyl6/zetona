import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    deviceSizes: [480, 768, 1024, 1440, 1920, 2400],
    imageSizes: [96, 160, 256, 384],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/portfolio",
        destination: "/work",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
