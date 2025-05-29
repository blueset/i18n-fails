import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { Media } from '@/payload-types'

const getPostsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 1,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
    })

    const dateFallback = new Date().toISOString()

    const sitemap = results.docs
      ? results.docs
          .filter((post) => Boolean(post?.slug))
          .map((post) => ({
            loc: `${SITE_URL}/posts/${post?.slug}`,
            lastmod: post.updatedAt || dateFallback,
            ...(post.sourceImages?.length || post.destinationImages?.length
              ? {
                  images: [
                    ...((post.sourceImages as Media[]) || [])
                      .filter((image) => image.url)
                      .map((image) => ({
                        loc: new URL(image.url),
                      })),
                    ...((post.destinationImages as Media[]) || [])
                      .filter((image) => image.url)
                      .map((image) => ({
                        loc: new URL(image.url),
                      })),
                  ],
                }
              : {}),
          }))
      : []

    return sitemap
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}
