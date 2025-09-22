import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Reimport built-in cache to disable size limit: https://stackoverflow.com/a/79229889
  cacheHandler: require.resolve(
    'next/dist/server/lib/incremental-cache/file-system-cache.js'
  ),
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
