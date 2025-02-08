import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound, permanentRedirect } from 'next/navigation'
import { siteTitle } from '@/utilities/constants'
import { queryBySlug } from '../../../../products/[slug]/queryBySlug'
import { ImageMedia } from '@/components/Media/ImageMedia'
import { allChildProducts } from '../../../../products/[slug]/childProducts'
import { ProductLogo } from '@/components/ProductLogo/ProductLogo'
import { ProductBreadcrumb } from '@/components/ProductBreadcrumb/ProductBreadcrumb'

export const revalidate = 600

type Args = {
  params: Promise<{
    slug: string
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber, slug } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const product = await queryBySlug({ slug })

  if (!product) notFound()
  if (product.parent || !product.childProducts?.docs?.length)
    permanentRedirect(`/products/${slug}/page/${pageNumber}`)

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const childProducts = await allChildProducts({ product })
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    draft: false,
    overrideAccess: false,
    where: {
      product: {
        in: childProducts.map(({ id }) => id),
      },
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16 flex flex-col gap-2">
        <ProductBreadcrumb product={product} collection="vendors" />
        <h1 className="text-4xl font-light">
          <ProductLogo product={product} className="h-10 w-10 inline-block align-top" />{' '}
          {product.title}
        </h1>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination
            page={posts.page}
            totalPages={posts.totalPages}
            collection={`vendors/${slug}`}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber, slug } = await paramsPromise
  const { title } = (await queryBySlug({ slug })) ?? {}
  return {
    title: `Page ${pageNumber || ''} | Vendor: ${title} | ${siteTitle}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'products',
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return Promise.all(
    categories.docs.map(async (category) => {
      const { totalDocs } = await payload.count({
        collection: 'posts',
        overrideAccess: false,
        where: {
          categories: {
            contains: category.id,
          },
        },
      })
      const totalPages = Math.ceil(totalDocs / 12)

      return Array.from({ length: totalPages }, (_, i) => ({
        slug: category.slug!,
        pageNumber: String(i + 1),
      }))
    }),
  ).then((pages) => pages.flat())
}
