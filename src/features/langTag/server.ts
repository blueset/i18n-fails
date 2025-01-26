import type { Field, FieldSchemaMap } from 'payload'

import {
  convertLexicalNodesToHTML,
  createNode,
  createServerFeature,
} from '@payloadcms/richtext-lexical'
import { ClientProps } from './client'
import { LangTagNode } from './node'
import { escapeHtml } from '@/utilities/escaepHTML'

export type LangTagFeatureServerProps = {
  fields?: Field[]
}

export const LangTagFeature = createServerFeature<
  LangTagFeatureServerProps,
  LangTagFeatureServerProps,
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
        name: 'lang',
        type: 'text',
        label: 'Language code (BCP 47)',
        required: true,
      },
    ]

    return {
      ClientFeature: '@/features/langTag/client#LangTagFeatureClient',
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

                const lang: string = escapeHtml(node.fields.lang ?? '')

                return `<span lang="${lang}">${childrenText}</span>`
              },
              nodeTypes: [LangTagNode.getType()],
            },
          },
          getSubFields: () => {
            return []
          },
          getSubFieldsData: ({ node }) => {
            return node?.fields
          },
          node: LangTagNode,
        }),
      ],
      sanitizedServerFeatureProps: props,
    }
  },
  key: 'langTag',
})
