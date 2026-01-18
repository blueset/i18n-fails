/* eslint-disable @next/next/no-img-element */
import { Category, Language, Media, Post, Product, User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import RSS from 'rss'
import { Fragment } from 'react'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToHTML } from '@/fields/lexicalFormatters'

async function FeedPostBody({
  post,
  richTextToHTML,
}: {
  post: Post
  richTextToHTML: (data: SerializedEditorState) => string
}) {
  const sourceLanguage = post.sourceLanguage as Language
  const destinationLanguages = (post.destinationLanguages as Language[]) ?? []
  const sourceImages = (post.sourceImages as Media[]) ?? []
  const destinationImages = (post.destinationImages as Media[]) ?? []
  const product = post.product as Product
  const productBreadcrumbs = (product?.breadcrumbs ?? []) as { label: string }[]

  return (
    <div>
      {!!productBreadcrumbs?.length && (
        <p>Product: {productBreadcrumbs.map((b) => b.label).join(' / ')}</p>
      )}
      <p>
        Source language:{' '}
        {sourceLanguage ? (
          <>
            {sourceLanguage.name} (
            <span lang={sourceLanguage.code}>{sourceLanguage.nativeName}</span>)
          </>
        ) : (
          '-'
        )}
      </p>
      {await Promise.all(
        sourceImages.map(async (image) => (
          <figure key={image.id}>
            <img src={'' + image.url} alt={image.alt ?? ''} />
            {image.caption && (
              <figcaption dangerouslySetInnerHTML={{ __html: richTextToHTML(image.caption) }} />
            )}
          </figure>
        )),
      )}
      <p>
        Destination languages:{' '}
        {!!destinationLanguages?.length
          ? destinationLanguages.map((l, idx) => (
              <Fragment key={l.id}>
                {idx !== 0 && ', '}
                {l.name} (<span lang={l.code}>{l.nativeName}</span>)
              </Fragment>
            ))
          : '-'}
      </p>
      {await Promise.all(
        destinationImages.map(async (image) => (
          <figure key={image.id}>
            <img src={'' + image.url} alt={image.alt ?? ''} />
            {image.caption && (
              <figcaption dangerouslySetInnerHTML={{ __html: richTextToHTML(image.caption) }} />
            )}
          </figure>
        )),
      )}
      {post.content && <div dangerouslySetInnerHTML={{ __html: richTextToHTML(post.content) }} />}
    </div>
  )
}

export async function GET() {
  const ReactDOMServer = (await import('react-dom/server')).default
  const site_url = getServerSideURL()

  const feedOptions = {
    title: 'i18n fails',
    description:
      'A collection of poorly carried out internationalization (i18n), localization (l10n), and translation of software user interfaces.',
    site_url: site_url,
    feed_url: `${site_url}/feed.xml`,
    image_url: `${site_url}/og.png`,
    pubDate: new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}, Ibas`,
  }

  const feed = new RSS(feedOptions)

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    draft: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
    overrideAccess: false,
  })

  const richTextToHTML = (data: SerializedEditorState) =>
    convertLexicalToHTML({
      data,
    })

  for (const post of posts.docs) {
    const sourceLanguage = post.sourceLanguage as Language
    const destinationLanguages = post.destinationLanguages as Language[]
    const categories = post.categories as Category[]
    const product = post.product as Product
    const productBreadcrumbs = (product?.breadcrumbs ?? []) as { label: string }[]
    feed.item({
      title: post.title,
      description: ReactDOMServer.renderToStaticMarkup(
        // <FeedPostBody post={post} richTextToHTML={richTextToHTML} />,
        await FeedPostBody({ post, richTextToHTML }),
      ),
      url: `${site_url}/posts/${post.slug}`,
      guid: post.id,
      categories: [
        ...(categories?.map((c) => c.title) ?? []),
        ...(productBreadcrumbs?.map((b) => b.label) ?? []),
        ...(sourceLanguage?.name ? [sourceLanguage.name] : []),
        ...(destinationLanguages?.map((l) => l.name) ?? []),
      ],
      date: post.createdAt,
      author: (post.authors as User[])?.map((author) => author.name).join(', '),
    })
  }

  return new Response(
    feed
      .xml({ indent: true })
      .replace(
        '<?xml version="1.0" encoding="UTF-8"?>',
        (s) => s + '<?xml-stylesheet href="/feed.xsl" type="text/xsl"?>',
      ),
    {
      headers: {
        'Content-Type': 'text/xml',
      },
    },
  )
}
