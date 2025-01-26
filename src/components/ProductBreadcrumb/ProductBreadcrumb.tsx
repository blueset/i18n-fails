import { Product } from '@/payload-types'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import Link from 'next/link'
import { Fragment } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ProductLogo } from '../ProductLogo/ProductLogo'

export async function ProductBreadcrumb({
  product,
  className,
  collection,
}: {
  product: Product
  className?: string
  collection: 'products' | 'vendors'
}) {
  const payload = await getPayload({ config: configPromise })
  const breadcrumbProducts = await Promise.all(
    product.breadcrumbs?.slice(0, -1)?.map((b) =>
      payload.findByID({
        collection: 'products',
        id: b.doc as string,
      }),
    ) ?? [],
  )
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          {collection === 'products' ? (
            <BreadcrumbLink asChild>
              <Link href="/products">Products</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/vendors">Vendors</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {breadcrumbProducts.map((product) => (
          <Fragment key={product.id}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${collection}/${product.slug}`}>
                  <ProductLogo
                    product={product}
                    className="inline-block h-4 w-4 align-middle mr-2"
                  />
                  {product.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
