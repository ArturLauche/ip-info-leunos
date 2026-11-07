import type { MetadataRoute } from 'next'
import { PRIVACY_LAST_UPDATED, TERMS_LAST_UPDATED } from '@/lib/content-dates'
import { canonicalUrl } from '@/lib/site-config'

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
    {
      path: '/privacy-policy',
      changeFrequency: 'monthly' as const,
      priority: 0.3,
      contentLastUpdated: PRIVACY_LAST_UPDATED,
    },
    {
      path: '/terms-of-use',
      changeFrequency: 'monthly' as const,
      priority: 0.3,
      contentLastUpdated: TERMS_LAST_UPDATED,
    },
  ]

  // The tool pages are evergreen shells around live lookups, so there is no
  // per-page content date to report. One uniform build timestamp avoids
  // implying false freshness differences between tools. Legal pages use their
  // actual revision dates instead.
  const buildTime = new Date()

  return routes.map((route) => ({
    url: canonicalUrl(route.path),
    lastModified:
      'contentLastUpdated' in route && route.contentLastUpdated
        ? new Date(route.contentLastUpdated)
        : buildTime,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
