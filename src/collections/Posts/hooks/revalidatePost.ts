import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/posts/${doc.slug}`

      payload.logger.info(`Revalidating post at path: ${path}`)

      try {
        revalidatePath(path)
      } catch (e) {
        console.error(e, 'Error revalidating path', path)
      }
      try {
        revalidateTag('posts-sitemap')
      } catch (e) {
        console.error(e, 'Error revalidating tag', 'posts-sitemap')
      }
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/posts/${previousDoc.slug}`

      payload.logger.info(`Revalidating old post at path: ${oldPath}`)

      try {
        revalidatePath(oldPath)
      } catch (e) {
        console.error(e, 'Error revalidating old path', oldPath)
      }
      try {
        revalidateTag('posts-sitemap')
      } catch (e) {
        console.error(e, 'Error revalidating tag', 'posts-sitemap')
      }
    }

    try {
      revalidatePath('/')
    } catch (e) {
      console.error(e, 'Error revalidating root path')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/posts/${doc?.slug}`

    revalidatePath(path)
    revalidatePath('/')
    revalidateTag('posts-sitemap')
  }

  return doc
}
