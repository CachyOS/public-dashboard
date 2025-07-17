import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
  // if NODE_ENV is production, remove console.log
  removeConsole:
    process.env.NODE_ENV === 'production'
      ? {
        exclude: ['error'],
      }
      : false,
  },
  experimental: {
    useCache: true,
  },
  transpilePackages: ['geist'],
  output: "standalone",
};

export default nextConfig;
