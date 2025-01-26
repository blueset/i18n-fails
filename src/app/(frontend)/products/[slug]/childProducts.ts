import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import configPromise from '@payload-config'
import { Product } from '@/payload-types'

export const allChildProducts = cache(async ({ product }: { product: Product }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })
  if (!product) return []
  const result = await payload.find({
    collection: 'products',
    draft,
    overrideAccess: draft,
    pagination: false,
  })

  return result.docs.filter((p) => p.breadcrumbs?.some((b) => b.doc === product.id))
})
