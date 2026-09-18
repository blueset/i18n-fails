import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'
import config from '@payload-config'

import type { Post } from '@/payload-types'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { getPayload } from 'payload'
import { ImageMedia } from '@/components/Media/ImageMedia'
import { ProductLogo } from '@/components/ProductLogo/ProductLogo'

export const PostHero: React.FC<{
  post: Post
}> = async ({ post }) => {
  const { categories, publishedAt, title, product, sourceImages, destinationImages, meta } = post
  const description = meta?.description
  const hasBothImages = sourceImages?.length && destinationImages?.length
  const payload = await getPayload({ config })

  const vendorBreadcrumb =
    typeof product === 'object' && (product?.breadcrumbs?.length ?? 0) > 1
      ? product?.breadcrumbs?.[0]
      : null
  const vendor =
    (typeof vendorBreadcrumb?.doc === 'string' &&
      (await payload.findByID({ collection: 'products', id: vendorBreadcrumb?.doc }))) ||
    null

  return (
    <div className="lg:grid lg:grid-cols-[1fr_48rem_1fr] pb-8 container">
      <div
        className={cn(
          'col-span-1 col-start-1',
          hasBothImages ? 'md:col-start-1 md:col-span-3' : 'md:col-start-2 md:col-span-1',
        )}
      >
        <header className="flex flex-col gap-2 lg:gap-4 mb-6 max-w-4xl">
          <h1 className="text-3xl md:text-5xl lg:text-6xl text-balance">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-lg lg:text-2xl">{description}</p>
          )}
        </header>

        <div className="flex md:flex-row flex-col flex-wrap gap-4 md:gap-x-16">
          {categories && (
            <div className="flex flex-col gap-1">
              <p className="text-sm">{categories?.length === 1 ? 'Tag' : 'Tags'}</p>

              <span>
                {categories
                  ?.filter((c) => typeof c === 'object')
                  ?.map((category, index) => {
                    const { title: categoryTitle, slug: categorySlug } = category
                    return (
                      <React.Fragment key={index}>
                        {index !== 0 && ', '}
                        <Button
                          variant="link"
                          asChild
                          size="clear"
                          className="items-center text-md"
                        >
                          <Link href={`/categories/${categorySlug}`}>{categoryTitle}</Link>
                        </Button>
                      </React.Fragment>
                    )
                  })}
              </span>
            </div>
          )}
          {publishedAt && (
            <div className="flex flex-col gap-1">
              <p className="text-sm">Date Published</p>

              <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
            </div>
          )}
          {vendor && (
            <div className="flex flex-col gap-1">
              <p className="text-sm">Vendor</p>

              <span>
                <Button variant="link" asChild size="clear" className="items-center text-md">
                  <Link href={`/vendors/${vendor.slug}`}>
                    <ProductLogo product={vendor} className="mr-2 w-5 h-5" />
                    {vendor.title}
                  </Link>
                </Button>
              </span>
            </div>
          )}
          {product && typeof product === 'object' && (
            <div className="flex flex-col gap-1">
              <p className="text-sm">Product</p>

              <span>
                <Button variant="link" asChild size="clear" className="items-center text-md">
                  <Link href={`/products/${product.slug}`}>
                    <ProductLogo product={product} className="mr-2 w-5 h-5" />
                    {product.title}
                  </Link>
                </Button>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
