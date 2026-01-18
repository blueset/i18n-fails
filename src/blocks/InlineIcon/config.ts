import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const InlineIconBlock: Block = {
  slug: 'inlineIcon',
  interfaceName: 'InlineIconBlock',
  fields: [
    {
      name: 'icon',
      type: 'text',
      required: true,
    },
  ],
  admin: {
    components: {
      Label: '@/blocks/InlineIcon/label#InlineIconLabel',
    },
  },
}
