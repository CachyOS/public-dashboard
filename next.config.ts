import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheHandler: require.resolve('./cache-handler.mjs'),
  cacheMaxMemorySize: 0, // disable default in-memory caching
  compiler: {
    // if NODE_ENV is production, remove console.log
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error'],
          }
        : false,
  },
  output: 'standalone',
  typedRoutes: true,
};

export default nextConfig;
