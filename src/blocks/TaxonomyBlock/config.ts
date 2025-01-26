import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Taxonomy: Block = {
  slug: 'taxonomy',
  interfaceName: 'TaxonomyBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
    {
      name: 'taxonomiesToShow',
      type: 'select',
      label: 'Taxonomies to show',
      hasMany: true,
      options: [
        {
          label: 'Vendors',
          value: 'vendors',
        },
        {
          label: 'Products',
          value: 'products',
        },
        {
          label: 'Languages',
          value: 'languages',
        },
        {
          label: 'Source languages',
          value: 'sourceLanguages',
        },
        {
          label: 'Target languages',
          value: 'targetLanguages',
        },
        {
          label: 'Categories',
          value: 'categories',
        },
      ],
    },
  ],
}
