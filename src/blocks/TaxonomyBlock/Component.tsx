import type {
  Category,
  Language,
  Product,
  TaxonomyBlock as TaxonomyBlockProps,
} from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Fragment } from 'react'
import RichText from '@/components/RichText'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TaxonommyChips } from './Chips'
import {
  taxonomyCollectionMapping,
  taxonomyNameMapping,
  TaxonomyType,
  taxonomyUrlSlugMapping,
} from './consts'

export const TaxonomyBlock: React.FC<
  TaxonomyBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, introContent } = props
  const payload = await getPayload({ config: configPromise })
  const taxonomiesToShow = props.taxonomiesToShow ?? []
  const queries = {
    products: taxonomiesToShow.some((t) => taxonomyCollectionMapping[t] === 'products')
      ? await payload
          .find({
            collection: 'products',
            pagination: false,
            sort: ['slug'],
          })
          .then((t) => t.docs)
      : [],
    languages: taxonomiesToShow.some((t) => taxonomyCollectionMapping[t] === 'languages')
      ? await payload
          .find({
            collection: 'languages',
            pagination: false,
            sort: ['slug'],
          })
          .then((t) => t.docs)
      : [],
    categories: taxonomiesToShow.some((t) => taxonomyCollectionMapping[t] === 'categories')
      ? await payload
          .find({
            collection: 'categories',
            pagination: false,
            sort: ['slug'],
          })
          .then((t) => t.docs)
      : [],
  }

  const vendors: Product[] = []
  const products: Product[] = []

  for (const product of queries.products) {
    if (product.parent || !product.childProducts?.docs?.length) {
      products.push(product)
    } else {
      vendors.push(product)
    }
  }

  const taxonomies = taxonomiesToShow
    ?.map((taxonomy): Product[] | Language[] | Category[] => {
      switch (taxonomy) {
        case 'vendors':
          return vendors
        case 'products':
          return products
        case 'languages':
          return queries.languages
        case 'sourceLanguages':
          return queries.languages.filter((d) => d.sourceLanguageOf?.docs?.length)
        case 'targetLanguages':
          return queries.languages.filter((d) => d.destinationLanguageOf?.docs?.length)
        case 'categories':
          return queries.categories
      }
    })
    .map(function <T>(result: T, idx: number): [TaxonomyType, T] {
      return [taxonomiesToShow[idx]!, result]
    })

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-8">
          <RichText className="ml-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      {taxonomies?.length ? (
        <div className="container grid md:grid-cols-[auto_1fr] grid-cols-1 gap-x-12 gap-y-4 md:gap-y-2 items-baseline">
          {taxonomies.map(([taxonomy, docs]) => {
            return (
              <Fragment key={taxonomy}>
                <Button
                  asChild
                  variant="link"
                  size="clear"
                  className="text-muted-foreground uppercase font-semibold text-xs tracking-wider"
                >
                  <Link href={`/${taxonomyUrlSlugMapping[taxonomy]}`}>
                    {taxonomyNameMapping[taxonomy]}
                  </Link>
                </Button>
                <TaxonommyChips docs={docs} taxonomy={taxonomy} />
              </Fragment>
            )
          })}
        </div>
      ) : (
        'Select taxonomies to show'
      )}
    </div>
  )
}
