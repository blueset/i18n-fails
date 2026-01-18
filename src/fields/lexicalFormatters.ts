import {
  convertLexicalToHTML as originalConvertLexicalToHTML,
  type HTMLConvertersFunction,
} from '@payloadcms/richtext-lexical/html'
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedInlineBlockNode,
} from '@payloadcms/richtext-lexical'
import {
  BannerBlock,
  CodeBlock,
  InlineIconBlock as InlineIconBlockType,
  Media,
  MediaBlock as MediaBlockType,
} from '@/payload-types'
import escapeHTML from 'escape-html'
import {
  convertHTMLToLexical as originalConvertHTMLToLexical,
  editorConfigFactory,
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
} from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { SanitizedConfig } from 'payload'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { InlineIconBlock } from '@/blocks/InlineIcon/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { AbbrFeature } from '@/features/abbr/server'
import { LangTagFeature } from '@/features/langTag/server'

type ConvertLexicalToHTMLArgs = Parameters<typeof originalConvertLexicalToHTML>[0]

type NodeTypes =
  | DefaultNodeTypes
  | SerializedInlineBlockNode<InlineIconBlockType>
  | SerializedBlockNode<MediaBlockType>
  | SerializedBlockNode<BannerBlock>
  | SerializedBlockNode<CodeBlock>

const htmlConverters: HTMLConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  abbr: ({ node, nodesToHTML }) =>
    `<abbr${node.title ? ` title="${node.title}"` : ''}>${nodesToHTML({ nodes: node.children })}</abbr>`,
  langTag: ({ node, nodesToHTML }) =>
    `<span lang="${node.lang}">${nodesToHTML({ nodes: node.children })}</span>`,
  blocks: {
    mediaBlock: ({ node, nodesToHTML }) => {
      const mediaObject: Partial<Media> =
        typeof node.fields.media === 'string' ? {} : node.fields.media
      const alt = escapeHTML(mediaObject.alt || '')
      const src = escapeHTML(mediaObject.url || '')
      const caption = mediaObject.caption
        ? nodesToHTML({ nodes: mediaObject.caption.root.children })
        : ''
      return `<figure><img src="${src}" alt="${alt}" /><figcaption>${caption}</figcaption></figure>`
    },
    banner: ({ node, nodesToHTML }) => {
      const style = node.fields.style
      const content = nodesToHTML({ nodes: node.fields.content.root.children })
      const styleEmoji =
        style === 'info'
          ? 'ℹ️'
          : style === 'error'
            ? '❌'
            : style === 'success'
              ? '✅'
              : style === 'warning'
                ? '⚠️'
                : `[${style}]`
      return `<blockquote>${styleEmoji} ${content}</blockquote>`
    },
    code: ({ node }) => {
      const language = escapeHTML(node.fields.language || 'plaintext')
      const codeContent = escapeHTML(node.fields.code || '')
      return `<pre><code class="language-${language}">${codeContent}</code></pre>`
    },
  },
  inlineBlocks: {
    // Each key should match your inline block's slug
    inlineIcon: ({ node }) => `<span>[icon: ${node.fields.icon}]</span>`,
  },
  unknown: ({ node, parent, ...args }) => {
    if (node.type === 'block') {
      return `<div>[Block: ${(node as SerializedBlockNode).fields.blockType}]</div>`
    }
    return `<div>[Node: ${node.type}]</div>`
  },
})

export function convertLexicalToHTML(args: ConvertLexicalToHTMLArgs): string {
  return originalConvertLexicalToHTML({
    ...args,
    converters: htmlConverters as HTMLConvertersFunction<DefaultNodeTypes>,
  })
}

export async function convertHTMLToLexical(
  html: string,
  config: SanitizedConfig,
): Promise<SerializedEditorState> {
  const editorConfig = await editorConfigFactory.fromFeatures({
    config,
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
      BlocksFeature({
        blocks: [Banner, Code, MediaBlock],
        inlineBlocks: [InlineIconBlock],
      }),
      InlineCodeFeature(),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
      AbbrFeature(),
      LangTagFeature(),
    ],
    isRoot: true,
  })
  return originalConvertHTMLToLexical({
    editorConfig,
    html,
    JSDOM,
  })
}
