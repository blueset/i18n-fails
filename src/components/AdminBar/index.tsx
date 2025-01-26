'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from 'payload-admin-bar'

import { cn } from '@/utilities/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from 'payload-admin-bar'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

import { getClientSideURL } from '@/utilities/getURL'

const baseClass = 'admin-bar'

const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
  projects: {
    plural: 'Projects',
    singular: 'Project',
  },
  languages: {
    plural: 'Languages',
    singular: 'Language',
  },
  categories: {
    plural: 'Categories',
    singular: 'Category',
  },
  products: {
    plural: 'Products',
    singular: 'Product',
  },
}

const segmentCollectionMapping = {
  vendors: 'products',
  'source-languages': 'languages',
  'destination-languages': 'languages',
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const mappedSegment = (segmentCollectionMapping[
    (segments?.[0] ?? '') as keyof typeof segmentCollectionMapping
  ] ?? segments?.[0]) as keyof typeof collectionLabels
  const collection = (
    collectionLabels[mappedSegment] ? mappedSegment : 'pages'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  const [collectionId, setCollectionId] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (!show) return
    const slug = segments?.[1]
    if (collection && slug) {
      fetch(`/api/${collection}?where[slug][equals]=${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.docs?.[0]?.id) {
            setCollectionId(data?.docs?.[0]?.id)
          } else {
            setCollectionId(undefined)
          }
        })
        .catch(() => {
          setCollectionId(undefined)
        })
    } else {
      setCollectionId(undefined)
    }
  }, [collection, segments])

  return (
    <div
      className={cn(baseClass, 'py-2 bg-black text-white', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={getClientSideURL()}
          collection={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          id={collectionId}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
