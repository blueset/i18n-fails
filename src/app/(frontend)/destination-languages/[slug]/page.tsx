import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import { siteTitle } from '@/utilities/constants'
import { queryBySlug } from './queryBySlug'

export const revalidate = 600

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const language = await queryBySlug({ slug })

  if (!language) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    where: {
      or: [
        {
          destinationLanguages: {
            contains: language?.id ?? '',
          },
        },
      ],
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16 flex flex-col gap-2">
        <h1 className="text-4xl font-light">Destination language: {language.name}</h1>
        <div className="text-xl text-muted-foreground">
          <code className="font-mono text-sm border-muted-foreground border p-1 inline-flex items-center rounded-xl h-7 mr-2 align-top">
            {language.code}
          </code>
          <span lang={language.code}>{language.nativeName}</span>
        </div>
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
            collection={`destination-languages/${slug}`}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const { name } = (await queryBySlug({ slug })) ?? {}
  return {
    title: `Destination language: ${name} | ${siteTitle}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const languages = await payload.find({
    collection: 'languages',
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return languages.docs.map(({ slug }) => ({ slug }))
}
