import {QueryClient} from '@tanstack/react-query';
import {createRouter} from '@tanstack/react-router';
import {setupRouterSsrQueryIntegration} from '@tanstack/react-router-ssr-query';
import {
  RouteError,
  RouteNotFound,
  RoutePending,
} from '@/components/ErrorBoundary';
import {routeTree} from './routeTree.gen';

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createRouter({
    context: {queryClient},
    defaultErrorComponent: RouteError,
    defaultNotFoundComponent: RouteNotFound,
    defaultPendingComponent: RoutePending,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
  });

  setupRouterSsrQueryIntegration({queryClient: queryClient, router});

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
