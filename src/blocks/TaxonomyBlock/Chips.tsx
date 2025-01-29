'use client'

import { Product, Category, Language } from '@/payload-types'
import Link from 'next/link'
import { OverflowList } from 'react-overflow-list'
import type { TaxonomyBlock as TaxonomyBlockProps } from '@/payload-types'
import { Button } from '@/components/ui/button'

export type TaxonomyType = Exclude<TaxonomyBlockProps['taxonomiesToShow'], null | undefined>[number]

export const taxonomyUrlSlugMapping = {
  vendors: 'vendors',
  products: 'products',
  languages: 'languages',
  sourceLanguages: 'source-languages',
  targetLanguages: 'target-languages',
  categories: 'categories',
} as const satisfies Record<TaxonomyType, string>

export function TaxonommyChips({
  docs,
  taxonomy,
}: {
  docs: (Product | Language | Category)[]
  taxonomy: TaxonomyType
}) {
  return (
    <OverflowList
      className="gap-2"
      items={docs}
      itemRenderer={function (item, index: number): React.ReactNode {
        return (
          <Button asChild variant="chip" size="xs" key={item.id}>
            <Link href={`/${taxonomyUrlSlugMapping[taxonomy]}/${item.slug}`}>
              {'name' in item ? item.name : 'title' in item ? item.title : ''}
            </Link>
          </Button>
        )
      }}
      overflowRenderer={function (items: unknown[]): React.ReactNode {
        return (
          <Button variant="chip" size="xs" key="overflow">
            <Link href={`/${taxonomyUrlSlugMapping[taxonomy]}`}> +{items.length}</Link>
          </Button>
        )
      }}
    />
  )
}
