import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { slugField } from '@/fields/slug'
import { createBreadcrumbsField } from '@payloadcms/plugin-nested-docs'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['title', 'slug', 'path'],
    pagination: {
      defaultLimit: 50,
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    createBreadcrumbsField('products', {
      admin: {
        components: {
          Cell: '@/collections/Products/AdminComponents#Cell',
        },
      },
    }),
    ...slugField(),
    {
      name: 'path',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true,
      },
      hooks: {
        // beforeChange: [
        //   ({ data }) => {
        //     delete data?.path
        //   },
        // ],
        afterRead: [
          ({ data }) => {
            return (
              data?.breadcrumbs?.map(({ label }: { label: string }) => label).join(' / ') ||
              data?.title
            )
          },
        ],
      },
    },
    {
      name: 'childProducts',
      type: 'join',
      collection: 'products',
      on: 'parent',
      defaultLimit: 1,
    },
  ],
}
