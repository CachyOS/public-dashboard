import type {Metadata} from 'next';

import {Geist, Geist_Mono} from 'next/font/google';

import {QueryProvider} from '@/components/query-provider';
import {ThemeProvider} from '@/components/theme-provider';

import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
