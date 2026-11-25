import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //
  // Dev only: lets a second local origin (127.0.0.1) load the app,
  // so two users can be signed in side by side in one browser
  //
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  }
};

export default nextConfig;
