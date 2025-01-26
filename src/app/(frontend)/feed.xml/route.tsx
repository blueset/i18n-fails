/* eslint-disable @next/next/no-img-element */
import { Category, Language, Media, Post, Product, User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import RSS from 'rss'
import { Fragment } from 'react'
import {
  consolidateHTMLConverters,
  convertLexicalNodesToHTML,
  convertLexicalToHTML,
  defaultEditorConfig,
  defaultEditorFeatures,
  HTMLConverterFeature,
  sanitizeServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import escapeHTML from 'escape-html'

async function FeedPostBody({
  post,
  richTextToHTML,
}: {
  post: Post
  richTextToHTML: (data: SerializedEditorState) => Promise<string>
}) {
  const sourceLanguage = post.sourceLanguage as Language
  const destinationLanguages = (post.destinationLanguages as Language[]) ?? []
  const sourceImages = (post.sourceImages as Media[]) ?? []
  const destinationImages = (post.destinationImages as Media[]) ?? []
  const product = post.product as Product
  const productBreadcrumbs = (product?.breadcrumbs ?? []) as { label: string }[]
  const siteUrl = getServerSideURL()

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
            <img src={siteUrl + image.url} alt={image.alt ?? ''} />
            {image.caption && (
              <figcaption
                dangerouslySetInnerHTML={{ __html: await richTextToHTML(image.caption) }}
              />
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
            <img src={siteUrl + image.url} alt={image.alt ?? ''} />
            {image.caption && (
              <figcaption
                dangerouslySetInnerHTML={{ __html: await richTextToHTML(image.caption) }}
              />
            )}
          </figure>
        )),
      )}
      {post.content && (
        <div dangerouslySetInnerHTML={{ __html: await richTextToHTML(post.content) }} />
      )}
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
    overrideAccess: false,
  })

  const editorConfig = defaultEditorConfig
  editorConfig.features = [...defaultEditorFeatures, HTMLConverterFeature({})]
  const sanitizedEditorConfig = await sanitizeServerEditorConfig(editorConfig, await configPromise)

  const richTextToHTML = (data: SerializedEditorState) =>
    convertLexicalToHTML({
      converters: [
        ...consolidateHTMLConverters({ editorConfig: sanitizedEditorConfig }),
        {
          nodeTypes: ['unknown'],
          converter: async ({ node, parent, ...args }) => {
            if (node.type === 'block') {
              const blockType = (node as any).fields.blockType
              if (blockType === 'mediaBlock') {
                const media = (node as any).fields.media
                return `<figure>
                  <img src="${escapeHTML(media.url)}" alt="${escapeHTML(media.alt)}" />
                  <figcaption>${media.caption ? await convertLexicalNodesToHTML({ lexicalNodes: media.caption.root.children, parent: { ...node, parent }, ...args }) : ''}</figcaption>
                </figure>`
              } else if (blockType === 'banner') {
                const style = (node as any).fields.style
                const content = (node as any).fields.content.root.children
                const styleEmoji =
                  style === 'info'
                    ? 'ℹ️'
                    : style === 'error'
                      ? '❌'
                      : style === 'success'
                        ? '✅'
                        : style === 'warning'
                          ? '⚠️'
                          : `[${style}]`
                return `<blockquote>${styleEmoji} ${await convertLexicalNodesToHTML({ lexicalNodes: content, parent: { ...node, parent }, ...args })}</blockquote>`
              }
              return `<div>[Block (${blockType}): ${(node as any).fields.blockName || '-'}]</div>`
            }
            return `<div>[Node: ${node.type}]</div>`
          },
        },
      ],
      data,
      payload,
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
