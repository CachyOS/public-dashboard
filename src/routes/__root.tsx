import {TanStackDevtools} from '@tanstack/react-devtools';
import type {QueryClient} from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import {TanStackRouterDevtoolsPanel} from '@tanstack/react-router-devtools';
import {ThemeProvider} from 'next-themes';

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import appCss from '../styles/globals.css?url';
import favicon from '../assets/icon.svg';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    links: [
      {href: appCss, rel: 'stylesheet'},
      {href: favicon, rel: 'icon'},
    ],
    meta: [
      {charSet: 'utf-8'},
      {content: 'width=device-width, initial-scale=1', name: 'viewport'},
      {
        content: import.meta.env.APP_VERSION || 'development',
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
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
