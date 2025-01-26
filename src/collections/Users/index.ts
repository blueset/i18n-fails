import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'username', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    tokenExpiration: 1000 * 60 * 60 * 24 * 365,
    loginWithUsername: {
      requireEmail: false,
      allowEmailLogin: true,
      requireUsername: false,
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'username',
      type: 'text',
      required: false,
    },
  ],
  timestamps: true,
}
