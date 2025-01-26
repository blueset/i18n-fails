import {
  $applyNodeReplacement,
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  BaseSelection,
  createCommand,
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  ElementNode,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  RangeSelection,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'
import { LangTagPayload } from './commands'

function randstr() {
  return Math.random().toString(36).replace('0.', '')
}

export type LangTagFields = {
  id?: string
  lang?: string
}
export type SerializedLangTagNode<T extends SerializedLexicalNode = SerializedLexicalNode> = Spread<
  {
    fields: LangTagFields
    id?: string
    type: 'langTag'
  },
  SerializedElementNode<T>
>

/** @noInheritDoc */
export class LangTagNode extends ElementNode {
  __fields: LangTagFields
  __id: string

  constructor({
    id,
    fields = {
      lang: '',
    },
    key,
  }: {
    fields: LangTagFields
    id: string
    key?: NodeKey
  }) {
    super(key)
    this.__fields = fields
    this.__id = id
  }

  static override clone(node: LangTagNode): LangTagNode {
    return new LangTagNode({
      id: node.__id,
      fields: node.__fields,
      key: node.__key,
    })
  }

  static override getType(): string {
    return 'langTag'
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      span: (node: Node) => ({
        conversion: $convertLangTagElement,
        priority: 1,
      }),
    }
  }

  static override importJSON(serializedNode: SerializedLangTagNode): LangTagNode {
    const node = $createLangTagNode({
      id: serializedNode.id,
      fields: serializedNode.fields,
    })
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
  }

  override canBeEmpty(): false {
    return false
  }

  override canInsertTextAfter(): false {
    return false
  }

  override canInsertTextBefore(): false {
    return false
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('span')
    element.lang = this.__fields.lang ?? ''

    // addClassNamesToElement(element, config.theme.link)
    return element
  }

  override exportJSON(): SerializedLangTagNode {
    const fields = this.getFields()
    const returnObject: SerializedLangTagNode = {
      ...super.exportJSON(),
      type: 'langTag',
      fields,
      version: 1,
    }
    const id = this.getID()
    if (id) {
      returnObject.id = id
    }
    return returnObject
  }

  override extractWithChild(
    child: LexicalNode,
    selection: BaseSelection,
    destination: 'clone' | 'html',
  ): boolean {
    if (!$isRangeSelection(selection)) {
      return false
    }

    const anchorNode = selection.anchor.getNode()
    const focusNode = selection.focus.getNode()

    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      selection.getTextContent().length > 0
    )
  }

  getFields(): LangTagFields {
    return this.getLatest().__fields
  }

  getID(): string {
    return this.getLatest().__id
  }

  override insertNewAfter(selection: RangeSelection, restoreSelection = true): ElementNode | null {
    const element = this.getParentOrThrow().insertNewAfter(selection, restoreSelection)
    if ($isElementNode(element)) {
      const linkNode = $createLangTagNode({ fields: this.__fields })
      element.append(linkNode)
      return linkNode
    }
    return null
  }

  override isInline(): true {
    return true
  }

  setFields(fields: LangTagFields): void {
    const writable = this.getWritable()
    writable.__fields = fields
  }

  override updateDOM(
    prevNode: LangTagNode,
    anchor: HTMLAnchorElement,
    config: EditorConfig,
  ): boolean {
    const lang = this.__fields?.lang
    if (lang != null && lang !== prevNode.__fields?.lang) {
      anchor.lang = lang
    }

    return false
  }
}

function $convertLangTagElement(domNode: Node): DOMConversionOutput {
  let node: LangTagNode | null = null
  if (domNode.nodeName === 'SPAN' && domNode instanceof HTMLElement && domNode.lang) {
    const content = domNode.textContent
    if (content !== null && content !== '') {
      node = $createLangTagNode({
        id: randstr(),
        fields: {
          lang: domNode.getAttribute('lang') ?? '',
        },
      })
    }
  }
  return { node }
}

export function $createLangTagNode({
  id,
  fields,
}: {
  fields: LangTagFields
  id?: string
}): LangTagNode {
  return $applyNodeReplacement(
    new LangTagNode({
      id: id ?? randstr(),
      fields,
    }),
  )
}

export function $isLangTagNode(node: LexicalNode | null | undefined): node is LangTagNode {
  return node instanceof LangTagNode
}

export const TOGGLE_LANG_TAG_COMMAND: LexicalCommand<LangTagPayload | null> =
  createCommand('TOGGLE_LANG_TAG_COMMAND')

export function $toggleLangTag(payload: ({ fields: LangTagFields } & LangTagPayload) | null): void {
  const selection = $getSelection()

  if (!$isRangeSelection(selection) && (payload === null || !payload.selectedNodes?.length)) {
    return
  }
  const nodes = $isRangeSelection(selection)
    ? selection.extract()
    : payload === null
      ? []
      : payload.selectedNodes

  if (payload === null) {
    // Remove LinkNodes
    nodes?.forEach((node) => {
      const parent = node.getParent()

      if ($isLangTagNode(parent)) {
        const children = parent.getChildren()

        for (let i = 0; i < children.length; i += 1) {
          parent.insertBefore(children[i]!)
        }

        parent.remove()
      }
    })

    return
  }
  // Add or merge LinkNodes
  if (nodes?.length === 1) {
    const firstNode = nodes[0]!
    // if the first node is a LinkNode or if its
    // parent is a LinkNode, we update the URL, target and rel.
    const linkNode: LangTagNode | null = $isLangTagNode(firstNode)
      ? firstNode
      : $getLangTagAncestor(firstNode)
    if (linkNode !== null) {
      linkNode.setFields(payload.fields)

      if (payload.text != null && payload.text !== linkNode.getTextContent()) {
        // remove all children and add child with new textcontent:
        linkNode.append($createTextNode(payload.text))
        linkNode.getChildren().forEach((child) => {
          if (child !== linkNode.getLastChild()) {
            child.remove()
          }
        })
      }
      return
    }
  }

  let prevParent: ElementNode | LangTagNode | null = null
  let langTagNode: LangTagNode | null = null

  nodes?.forEach((node) => {
    const parent = node.getParent()

    if (parent === langTagNode || parent === null || ($isElementNode(node) && !node.isInline())) {
      return
    }

    if ($isLangTagNode(parent)) {
      langTagNode = parent
      parent.setFields(payload.fields)
      if (payload.text != null && payload.text !== parent.getTextContent()) {
        // remove all children and add child with new textcontent:
        parent.append($createTextNode(payload.text))
        parent.getChildren().forEach((child) => {
          if (child !== parent.getLastChild()) {
            child.remove()
          }
        })
      }
      return
    }

    if (!parent.is(prevParent)) {
      prevParent = parent
      langTagNode = $createLangTagNode({ fields: payload.fields })

      if ($isLangTagNode(parent)) {
        if (node.getPreviousSibling() === null) {
          parent.insertBefore(langTagNode)
        } else {
          parent.insertAfter(langTagNode)
        }
      } else {
        node.insertBefore(langTagNode)
      }
    }

    if ($isLangTagNode(node)) {
      if (node.is(langTagNode)) {
        return
      }
      if (langTagNode !== null) {
        const children = node.getChildren()

        for (let i = 0; i < children.length; i += 1) {
          langTagNode.append(children[i]!)
        }
      }

      node.remove()
      return
    }

    if (langTagNode !== null) {
      langTagNode.append(node)
    }
  })
}

function $getLangTagAncestor(node: LexicalNode): LangTagNode | null {
  return $getAncestor(node, (ancestor) => $isLangTagNode(ancestor)) as LangTagNode
}

function $getAncestor(
  node: LexicalNode,
  predicate: (ancestor: LexicalNode) => boolean,
): LexicalNode | null {
  let parent: LexicalNode | null = node
  while (parent !== null) {
    parent = parent.getParent()
    if (parent === null || predicate(parent)) {
      break
    }
  }
  return parent
}
