import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const InlineLangBlock: Block = {
  slug: 'inlineLang',
  interfaceName: 'InlineLanguageBlock',
  fields: [
    {
      name: 'language',
      type: 'text',
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor(),
      label: false,
    },
  ],
}
