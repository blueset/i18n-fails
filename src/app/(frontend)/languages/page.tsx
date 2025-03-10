import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { siteTitle } from '@/utilities/constants'
import { CollectionArchive } from './CollectionArchive'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const languages = await payload.find({
    collection: 'languages',
    depth: 1,
    limit: -1,
    overrideAccess: false,
    sort: ['code'],
    select: {
      name: true,
      nativeName: true,
      slug: true,
      code: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Languages</h1>
        </div>
      </div>

      <div className="container mb-8">
        <div className="font-semibold">
          Showing {languages.totalDocs} language{languages.totalDocs === 1 ? '' : 's'}
        </div>
      </div>

      <CollectionArchive languages={languages} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Languages | ${siteTitle}`,
  }
}
