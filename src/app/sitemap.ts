import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/pengurus`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/pik-rform`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/kegiatans`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // If you want to add dynamic URLs (e.g., each kegiatan detail page), fetch them here and push into the array.

  return staticRoutes
}
