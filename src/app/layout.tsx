import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import type { TemplateString } from 'next/dist/lib/metadata/types/metadata-types';
import { Geist, Geist_Mono } from 'next/font/google';

import { ThemeProvider } from '@/components/theme';
import { config } from '@/lib/site';

import { Header } from './layout.client';

import './globals.css';

const geist = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

const rootTitleTemplate: TemplateString = {
  absolute: config.title,
};

export const metadata: Metadata = {
  title: rootTitleTemplate,
  description: config.description,
  metadataBase: config.siteUrl,
  keywords: config.keywords,
  openGraph: {
    title: rootTitleTemplate,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`font-sans antialiased ${geist.className} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
