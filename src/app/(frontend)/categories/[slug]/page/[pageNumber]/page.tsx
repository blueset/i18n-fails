import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import { siteTitle } from '@/utilities/constants'
import { queryBySlug } from '../../queryBySlug'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import RichText from '@/components/RichText'

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

  const category = await queryBySlug({ slug })

  if (!category) notFound()

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
    draft: false,
    where: {
      categories: {
        contains: category?.id ?? '',
      },
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="mb-16 container">
        <div className="dark:prose-invert max-w-none prose">
          <h1>Tag: {category?.title}</h1>
        </div>
        {category.content && (
          <div className="dark:prose-invert prose">
            <RichText
              className="col-span-1 md:col-span-1 col-start-1 md:col-start-2 w-full"
              data={category.content as SerializedEditorState}
              enableGutter={false}
            />
          </div>
        )}
      </div>

      <div className="mb-8 container">
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
            collection={`categories/${slug}`}
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
    title: `Page ${pageNumber || ''} | Tag: ${title} | ${siteTitle}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
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
