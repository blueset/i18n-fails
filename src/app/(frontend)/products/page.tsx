import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { siteTitle } from '@/utilities/constants'
import Link from 'next/link'
import { Product } from '@/payload-types'
import { ProductLogo } from '@/components/ProductLogo/ProductLogo'

export const dynamic = 'force-static'
export const revalidate = 600

interface TreeProduct extends Product {
  children: TreeProduct[]
}

function buildTree(items: Product[]) {
  const map: Record<string, TreeProduct> = {}
  items.forEach((item) => {
    map[item.id] = { ...item, children: [] }
  })
  const roots: TreeProduct[] = []
  items.forEach((item) => {
    const parent = item.parent as Product | undefined
    if (parent?.id) {
      map[parent.id]!.children.push(map[item.id]!)
    } else {
      roots.push(map[item.id]!)
    }
  })
  return roots
}

function TreeNode({ node, level }: { node: TreeProduct; level: number }) {
  const collection = level > 0 || node.children.length === 0 ? 'products' : 'vendors'
  return (
    <div>
      <Link
        className="flex flex-row items-center gap-2 col-span-4 mb-4 font-light text-4xl hover:underline focus-visible:underline underline-offset-4"
        href={`/${collection}/${node.slug}`}
      >
        <ProductLogo product={node} className="w-8 h-8" />
        {node.title}
      </Link>
      <div className="ml-4 md:ml-10">
        {node.children.map((child) => (
          <TreeNode key={child.id} node={child} level={level + 1} />
        ))}
      </div>
    </div>
  )
}

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 0,
    pagination: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      logo: true,
      parent: true,
    },
  })
  const tree = buildTree(products.docs as Product[])
  const vendorCount = tree.filter((node) => node.children.length).length
  const productCount = products.totalDocs - vendorCount

  return (
    <div className="pt-24 pb-24">
      <div className="mb-16 container">
        <div className="dark:prose-invert max-w-none prose">
          <h1>Products</h1>
        </div>
      </div>

      <div className="mb-8 container">
        <div className="font-semibold">
          Showing {productCount} product{productCount === 1 ? '' : 's'} and {vendorCount} vendor
          {vendorCount === 1 ? '' : 's'}
        </div>
      </div>

      <div className="container">
        {tree
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((node) => (
            <TreeNode key={node.id} node={node} level={0} />
          ))}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Products | ${siteTitle}`,
  }
}
