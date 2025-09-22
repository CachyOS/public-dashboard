import type {Metadata} from 'next';

import {Inter, JetBrains_Mono} from 'next/font/google';

import {QueryProvider} from '@/components/query-provider';
import {ThemeProvider} from '@/components/theme-provider';

import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-inter-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  other: {
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'development',
  },
  title: {
    default: 'CachyOS',
    template: 'CachyOS | %s ',
  },
};

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html
      className={`${sans.variable} ${mono.variable} antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
