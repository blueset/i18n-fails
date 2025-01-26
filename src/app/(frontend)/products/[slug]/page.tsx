import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound, permanentRedirect } from 'next/navigation'
import { siteTitle } from '@/utilities/constants'
import { queryBySlug } from './queryBySlug'
import { allChildProducts } from './childProducts'
import { ImageMedia } from '@/components/Media/ImageMedia'
import { ProductBreadcrumb } from '@/components/ProductBreadcrumb/ProductBreadcrumb'

export const revalidate = 600

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const product = await queryBySlug({ slug })

  if (!product) notFound()
  if (!product.parent && product.childProducts?.docs?.length) permanentRedirect(`/vendors/${slug}`)

  const childProducts = await allChildProducts({ product })
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
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
        <ProductBreadcrumb product={product} collection="products" />
        <h1 className="text-4xl font-light">
          {product.logo && (
            <ImageMedia
              resource={product.logo}
              imgClassName="h-10 w-10 object-contain inline-block align-top"
            />
          )}{' '}
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
            collection={`products/${slug}`}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const { title } = (await queryBySlug({ slug })) ?? {}
  return {
    title: `Product: ${title} | ${siteTitle}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const languages = await payload.find({
    collection: 'products',
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return languages.docs.map(({ slug }) => ({ slug }))
}
