import { JSXConverter } from '@payloadcms/richtext-lexical/react'
import { SerializedLangTagNode } from './node'

export const LangTagConverter: JSXConverter<SerializedLangTagNode> = ({ node, nodesToJSX }) => {
  return <span lang={node.fields.lang}>{nodesToJSX({ nodes: node.children })}</span>
}
