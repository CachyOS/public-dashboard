import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from '@tanstack/react-query';

export const STALE_TIME = 60 * 1000; // 1 minute

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: () => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false;
        },
      },
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: STALE_TIME,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
