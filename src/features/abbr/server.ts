import type { Field, FieldSchemaMap } from 'payload'

import {
  convertLexicalNodesToHTML,
  createNode,
  createServerFeature,
} from '@payloadcms/richtext-lexical'
import { ClientProps } from './client'
import { AbbrNode } from './node'
import { escapeHtml } from '@/utilities/escaepHTML'

export type AbbrFeatureServerProps = {
  fields?: Field[]
}

export const AbbrFeature = createServerFeature<
  AbbrFeatureServerProps,
  AbbrFeatureServerProps,
  ClientProps
>({
  feature: async ({ config: _config, props }) => {
    if (!props) {
      props = {}
    }

    const fields: Field[] = [
      {
        name: 'text',
        type: 'text',
        label: 'Text to display',
        required: true,
      },
      {
        name: 'title',
        type: 'text',
        label: 'Title',
        required: true,
      },
    ]

    return {
      ClientFeature: '@/features/abbr/client#AbbrFeatureClient',
      clientFeatureProps: {} as ClientProps,
      generateSchemaMap: () => {
        const schemaMap: FieldSchemaMap = new Map()
        schemaMap.set('fields', {
          fields: fields,
        })
        return schemaMap
      },
      nodes: [
        createNode({
          converters: {
            html: {
              converter: async ({
                converters,
                currentDepth,
                depth,
                draft,
                node,
                overrideAccess,
                parent,
                req,
                showHiddenFields,
              }) => {
                const childrenText = await convertLexicalNodesToHTML({
                  converters,
                  currentDepth,
                  depth,
                  draft,
                  lexicalNodes: node.children,
                  overrideAccess,
                  parent: {
                    ...node,
                    parent,
                  },
                  req,
                  showHiddenFields,
                })

                const title: string = escapeHtml(node.fields.title ?? '')

                return `<abbr title="${title}">${childrenText}</abbr>`
              },
              nodeTypes: [AbbrNode.getType()],
            },
          },
          getSubFields: () => {
            return []
          },
          getSubFieldsData: ({ node }) => {
            return node?.fields
          },
          node: AbbrNode,
        }),
      ],
      sanitizedServerFeatureProps: props,
    }
  },
  key: 'abbr',
})
