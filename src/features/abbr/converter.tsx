import { JSXConverter } from '@payloadcms/richtext-lexical/react'
import { SerializedAbbrNode } from './node'

export const AbbrConverter: JSXConverter<SerializedAbbrNode> = ({ node, nodesToJSX }) => {
  return <abbr title={node.fields.title}>{nodesToJSX({ nodes: node.children })}</abbr>
}
