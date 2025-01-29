'use client'

import { Product, Category, Language } from '@/payload-types'
import Link from 'next/link'
import { OverflowList } from 'react-overflow-list'
import { Button } from '@/components/ui/button'
import { TaxonomyType, taxonomyUrlSlugMapping } from './consts'

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
      itemRenderer={function (item): React.ReactNode {
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
