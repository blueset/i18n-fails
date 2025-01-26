import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { slugField } from '@/fields/slug'

export const Languages: CollectionConfig = {
  slug: 'languages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'nativeName', 'code', 'slug'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'nativeName',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      label: 'BCP 47 code',
      required: true,
    },
    ...slugField('code'),
    {
      name: 'sourceLanguageOf',
      type: 'join',
      collection: 'posts',
      on: 'sourceLanguage',
      defaultLimit: 1,
      admin: {
        allowCreate: false,
      },
    },
    {
      name: 'destinationLanguageOf',
      type: 'join',
      collection: 'posts',
      on: 'destinationLanguages',
      defaultLimit: 1,
      admin: {
        allowCreate: false,
      },
    },
  ],
}
