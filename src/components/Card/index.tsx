'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { Button } from '../ui/button'
import { ArrowRightIcon } from 'lucide-react'

export type CardPostData = Pick<
  Post,
  'slug' | 'categories' | 'meta' | 'title' | 'sourceLanguage' | 'destinationLanguages' | 'product'
>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, product, sourceLanguage, destinationLanguages } = doc || {}
  const { image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full ">
        {!metaImage && <div className="">No image</div>}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
      </div>
      <div className="p-4 flex flex-col gap-2">
        {showCategories && hasCategories && (
          <div className="text-sm">
            {showCategories && hasCategories && (
              <div className="">
                {categories
                  ?.filter((c) => typeof c === 'object')
                  ?.map(({ title, slug }, index) => (
                    <Button size="xs-clear" variant="link" asChild key={index}>
                      <Link href={`/categories/${slug}`}>{title}</Link>
                    </Button>
                  ))}
                {typeof product === 'object' &&
                  product?.breadcrumbs?.map(({ label, url }, index) => (
                    <Fragment key={index}>
                      {', '}
                      <Button size="xs-clear" variant="link" asChild>
                        <Link href={`/products/${url ?? ''}`}>{label}</Link>
                      </Button>
                    </Fragment>
                  ))}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3 className="leading-6 text-trim">
              <Link
                className="not-prose hover:underline underline-offset-4"
                href={href}
                ref={link.ref}
              >
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        <div className="items-center">
          {typeof sourceLanguage === 'object' ? (
            <Button size="xs-clear" variant="link" asChild>
              <Link href={`/source-languages/${sourceLanguage?.slug}`}>{sourceLanguage?.name}</Link>
            </Button>
          ) : (
            <Button size="xs-clear" variant="link" disabled>
              Unknown
            </Button>
          )}
          <ArrowRightIcon size="1em" className="inline-block mx-1" />
          {destinationLanguages?.length ? (
            destinationLanguages
              .filter((l) => typeof l === 'object')
              .map((lang, idx) => (
                <Fragment key={lang.slug}>
                  {idx !== 0 && ', '}
                  <Button size="xs-clear" variant="link" asChild>
                    <Link href={`/destination-languages/${lang.slug}`}>{lang.name}</Link>
                  </Button>
                </Fragment>
              ))
          ) : (
            <Button size="xs-clear" variant="link" disabled>
              Unknown
            </Button>
          )}
        </div>
        {/* {description && <div className="mt-2">{description && <p>{description}</p>}</div>} */}
      </div>
    </article>
  )
}
