import { Button } from '@/components/ui/button'
import type { Language } from '@/payload-types'
import Link from 'next/link'
import type { PaginatedDocs } from 'payload'

export function CollectionArchive({
  languages,
  collection = 'languages',
}: {
  languages: PaginatedDocs<Pick<Language, 'name' | 'nativeName' | 'slug' | 'code'>>
  collection?: string
}) {
  return (
    <div className="container">
      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
        {languages.docs.map((c) => (
          <Link
            key={c.slug}
            className="col-span-4 flex flex-col gap-2 [&:hover>div:first-child]:underline"
            href={`/${collection}/${c.slug}`}
          >
            <div className="text-4xl font-light">{c.name}</div>
            <div className="text-xl text-muted-foreground" lang={c.code}>
              {c.nativeName}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
