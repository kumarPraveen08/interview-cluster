import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/interview-cluster',
  assetPrefix: '/interview-cluster',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
