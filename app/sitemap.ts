import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1 },
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

  return routes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
