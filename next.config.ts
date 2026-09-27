import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2", "web-push"],
  devIndicators: false,
};

export default nextConfig;
