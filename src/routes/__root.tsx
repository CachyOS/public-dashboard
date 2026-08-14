import {TanStackDevtools} from '@tanstack/react-devtools';
import type {QueryClient} from '@tanstack/react-query';
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools';
import {
  CatchBoundary,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import {TanStackRouterDevtoolsPanel} from '@tanstack/react-router-devtools';
import {RouteError} from '@/components/ErrorBoundary';
import {ThemeProvider} from '@/components/theme-provider';
import favicon from '../assets/icon.svg';
import appCss from '../styles/globals.css?url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  errorComponent: RouteError,
  head: () => ({
    links: [
      {href: appCss, rel: 'stylesheet'},
      {href: favicon, rel: 'icon'},
    ],
    meta: [
      {charSet: 'utf-8'},
      {content: 'width=device-width, initial-scale=1', name: 'viewport'},
      {
        content: import.meta.env.VITE_APP_VERSION || 'development',
        name: 'version',
      },
      {
        content: 'CachyOS Package Repository Dashboard',
        property: 'og:title',
      },
      {
        content: 'Search and view packages across all CachyOS repositories.',
        property: 'og:description',
      },
      {
        content: 'website',
        property: 'og:type',
      },
      {
        content: 'https://dashboard.cachyos.org/',
        property: 'og:url',
      },
      {
        content: 'https://dashboard.cachyos.org/icon.svg',
        property: 'og:image',
      },
      {title: 'CachyOS'},
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <CatchBoundary errorComponent={RouteError} getResetKey={() => 'root'}>
            {children}
          </CatchBoundary>
        </ThemeProvider>
        <TanStackDevtools
          config={{position: 'bottom-right'}}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'TanStack Query',
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
