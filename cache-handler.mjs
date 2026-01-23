import {CacheHandler} from '@fortedigital/nextjs-cache-handler';
import createCompositeHandler from '@fortedigital/nextjs-cache-handler/composite';
import {ioredisAdapter} from '@fortedigital/nextjs-cache-handler/helpers/ioredisAdapter';
import createLruHandler from '@fortedigital/nextjs-cache-handler/local-lru';
import createRedisHandler from '@fortedigital/nextjs-cache-handler/redis-strings';
import Redis from 'ioredis';
import {PHASE_PRODUCTION_BUILD} from 'next/constants.js';

async function createCacheConfig() {
  const redisClient = await setupRedisClient();
  const lruCache = createLruHandler();

  if (!redisClient) {
    const config = {handlers: [lruCache]};
    globalThis.cacheHandlerConfigPromise = null;
    globalThis.cacheHandlerConfig = config;
    return config;
  }

  const redisCacheHandler = createRedisHandler({
    client: redisClient,
    keyPrefix: 'nextjs:',
  });

  const config = {
    handlers: [
      createCompositeHandler({
        handlers: [lruCache, redisCacheHandler],
        setStrategy: ctx => (ctx?.tags.includes('memory-cache') ? 0 : 1),
      }),
    ],
  };

  globalThis.cacheHandlerConfigPromise = null;
  globalThis.cacheHandlerConfig = config;

  return config;
}

async function setupRedisClient() {
  if (PHASE_PRODUCTION_BUILD !== process.env.NEXT_PHASE) {
    let redisClient;

    if (process.env.CACHE !== 'redis') {
      console.warn(
        '[CacheHandler] REDIS is disabled. Skipping Redis client setup.'
      );
      return null;
    }

    try {
      console.info(`[CacheHandler] Using ioredis client...`);
      const redisUrl = new URL(
        process.env.REDIS_URL ?? 'http://localhost:6379'
      );
      const ioredisClient = new Redis({
        name: process.env.REDIS_MASTER_NAME ?? 'shard_master0',
        password: process.env.REDIS_PASSWORD ?? '1234',
        sentinelPassword: process.env.REDIS_SENTINEL_PASSWORD ?? '1234',
        sentinels: [{host: redisUrl.hostname}],
      });
      console.info('[CacheHandler] Connecting ioredis client...');
      await new Promise((resolve, reject) => {
        ioredisClient.once('ready', () => {
          console.info('[CacheHandler] ioredis client connected.');
          resolve();
        });
        ioredisClient.once('error', reject);
      });

      redisClient = ioredisAdapter(ioredisClient);

      redisClient.on('error', e => {
        if (process.env.NEXT_PRIVATE_DEBUG_CACHE !== undefined) {
          console.warn('[CacheHandler] Redis error', e);
        }
        globalThis.cacheHandlerConfig = null;
        globalThis.cacheHandlerConfigPromise = null;
      });

      if (!redisClient.isReady) {
        console.error('[CacheHandler] Failed to initialize caching layer.');
      }

      return redisClient;
    } catch (error) {
      console.warn('[CacheHandler] Failed to connect Redis client:', error);
      if (redisClient) {
        try {
          redisClient.destroy();
        } catch (e) {
          console.error(
            '[CacheHandler] Failed to quit the Redis client after failing to connect.',
            e
          );
        }
      }
    }
  }

  return null;
}

CacheHandler.onCreation(() => {
  // Important - It's recommended to use global scope to ensure only one Redis connection is made
  // This ensures only one instance get created
  if (globalThis.cacheHandlerConfig) {
    return globalThis.cacheHandlerConfig;
  }
  if (globalThis.cacheHandlerConfigPromise) {
    return globalThis.cacheHandlerConfigPromise;
  }

  const promise = createCacheConfig();
  globalThis.cacheHandlerConfigPromise = promise;

  return promise;
});

export default CacheHandler;
