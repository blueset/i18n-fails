import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'
import { Category } from '@/payload-types'

export const revalidatePost: CollectionAfterChangeHook<Category> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/categories/${doc.slug}`
    payload.logger.info(`Revalidating post at path: ${path}`)
    revalidatePath(path)
    revalidatePath('/categories')
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Category> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/categories/${doc?.slug}`

    revalidatePath(path)
  }
  revalidatePath('/categories')

  return doc
}
