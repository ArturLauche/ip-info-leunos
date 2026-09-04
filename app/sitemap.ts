import type { MetadataRoute } from 'next'
import { canonicalUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/', changeFrequency: 'daily' as const, priority: 1 },
    { path: '/check', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/asn', changeFrequency: 'weekly' as const, priority: 0.85 },
    { path: '/ping', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/dns', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/whois', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/cdn', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/reputation', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/privacy-policy', changeFrequency: 'monthly' as const, priority: 0.3 },
    { path: '/terms-of-use', changeFrequency: 'monthly' as const, priority: 0.3 },
  ]

  // lastModified is the build time: tool pages are evergreen shells around
  // live lookups, so there is no per-page content date to report. Emitting
  // one uniform timestamp keeps crawlers from inferring false freshness
  // differences between tools.
  const lastModified = new Date();

  return routes.map((route) => ({
    url: canonicalUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
