import {TanStackDevtools} from '@tanstack/react-devtools';
import type {QueryClient} from '@tanstack/react-query';
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import {TanStackRouterDevtoolsPanel} from '@tanstack/react-router-devtools';
import {ThemeProvider} from 'next-themes';
import favicon from '../assets/icon.svg';
import appCss from '../styles/globals.css?url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
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
          {children}
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
