import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { headers } from 'next/headers'
import './globals.css'
import { schemaInLanguage, siteConfig } from '@/lib/seo'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { StructuredData } from '@/components/structured-data'
import { AppShell } from '@/components/shell/app-shell'
import { resolveLocale } from '@/lib/i18n'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'IP Auskunft - Deine IP & Netzwerk-Info',
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Canonical URLs are set per page via createPageMetadata. A root canonical
  // would leak onto the 404 route and tell crawlers that missing URLs are the homepage.
  alternates: {
    types: {
      'text/plain': `${siteConfig.url}/llms.txt`,
    },
  },
  applicationName: siteConfig.name,
  referrer: 'origin-when-cross-origin',
  keywords: siteConfig.keywords,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'technology',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      {
        url: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/apple-icon.png`,
        width: 180,
        height: 180,
        caption: `${siteConfig.name} Logo`,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: schemaInLanguage,
      publisher: { '@id': `${siteConfig.url}/#organization` },
    },
    // The WebApplication node is emitted per page by ToolStructuredData;
    // a second site-wide copy here would duplicate the graph on every route.
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = resolveLocale((await headers()).get('accept-language'))

  return (
    // lang follows the negotiated locale so the declared document language
    // always matches the UI language the shell and checkers render.
    <html lang={locale} suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <StructuredData data={jsonLd} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell locale={locale}>{children}</AppShell>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
