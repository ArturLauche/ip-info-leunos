import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { siteConfig } from '@/lib/seo'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { StructuredData } from '@/components/structured-data'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'IP Auskunft - Deine IP & Netzwerk-Info',
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
    types: {
      'text/plain': `${siteConfig.url}/llms.txt`,
    },
  },
  applicationName: siteConfig.name,
  generator: 'Next.js',
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
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
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
      inLanguage: ['de-DE', 'en'],
      publisher: { '@id': `${siteConfig.url}/#organization` },
    },
    {
      '@type': ['SoftwareApplication', 'WebApplication'],
      '@id': `${siteConfig.url}/#software`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: 'Internet and network information toolbox',
      operatingSystem: 'Any system with a modern web browser',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'EUR' },
      featureList: [
        'Öffentliche IPv4- und IPv6-Adresse anzeigen',
        'Öffentliche IP-Adressen und Domains analysieren',
        'ASN-, Prefix-, Routing- und Peeringdaten nachschlagen',
        'DNS- und Whois-Daten abfragen',
        'CDN- und Edge-Anbieter-Signale erkennen',
        'Öffentliche Hosts, Ports und Dienste auf Erreichbarkeit prüfen',
        'IP-Reputation mit Blacklist- und Netzwerksignalen einordnen',
      ],
      provider: { '@id': `${siteConfig.url}/#organization` },
      isPartOf: { '@id': `${siteConfig.url}/#website` },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <StructuredData data={jsonLd} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
