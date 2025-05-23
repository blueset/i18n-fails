import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Post } from '@/payload-types'

import RichText from '@/components/RichText'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { HeroGallery } from './HeroGallery'
import { MediaProvider } from '@/components/Lightbox/LightboxProvider'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/posts/' + slug
  const post = await queryPostBySlug({ slug })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <MediaProvider>
      <article className="pt-16 pb-16">
        {/* <PageClient /> */}

        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        <PostHero post={post} />
        <HeroGallery post={post} />

        <div className="flex flex-col items-center gap-4">
          <div className="lg:grid lg:grid-cols-[1fr_48rem_1fr] container">
            <RichText
              className="col-span-1 md:col-span-1 col-start-1 md:col-start-2 w-full"
              data={post.content as SerializedEditorState}
              enableGutter={false}
            />
            {/* {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="lg:grid lg:grid-cols-subgrid grid-rows-[2fr] col-span-3 col-start-1 mt-12 max-w-[52rem]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )} */}
            {post.relevantLinks && post.relevantLinks.length > 0 && (
              <div className="col-span-1 md:col-span-1 col-start-1 md:col-start-2 dark:prose-invert mt-12 w-full max-w-none prose md:prose-md">
                <h2>External links</h2>
                <ul>
                  {post.relevantLinks.map((link) => {
                    return (
                      <li key={link.id}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.title}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </article>
    </MediaProvider>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
