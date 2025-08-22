import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
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
  output: 'standalone',
  transpilePackages: ['geist'],
};

export default nextConfig;
