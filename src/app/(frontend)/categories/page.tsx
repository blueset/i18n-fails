import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { siteTitle } from '@/utilities/constants'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
    depth: 1,
    pagination: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Tags</h1>
        </div>
      </div>

      <div className="container mb-8">
        <div className="font-semibold">
          Showing {categories.totalDocs} tag{categories.totalDocs === 1 ? '' : 's'}
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {categories.docs.map((c) => (
            <Button
              key={c.slug}
              asChild
              variant="link"
              size="clear"
              className="text-4xl font-light col-span-4"
            >
              <Link href={`/categories/${c.slug}`}>{c.title}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Tags | ${siteTitle}`,
  }
}
