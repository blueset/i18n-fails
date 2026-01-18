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
import { AbbrPayload } from './commands'

function randstr() {
  return Math.random().toString(36).replace('0.', '')
}

export type AbbrFields = {
  id?: string
  title?: string
}
export type SerializedAbbrNode<T extends SerializedLexicalNode = SerializedLexicalNode> = Spread<
  {
    fields: AbbrFields
    id?: string
    type: 'abbr'
  },
  SerializedElementNode<T>
>

/** @noInheritDoc */
export class AbbrNode extends ElementNode {
  __fields: AbbrFields
  __id: string

  constructor({
    id,
    fields = {
      title: '',
    },
    key,
  }: {
    fields: AbbrFields
    id: string
    key?: NodeKey
  }) {
    super(key)
    this.__fields = fields
    this.__id = id
  }

  static override clone(node: AbbrNode): AbbrNode {
    return new AbbrNode({
      id: node.__id,
      fields: node.__fields,
      key: node.__key,
    })
  }

  static override getType(): string {
    return 'abbr'
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      abbr: (node: Node) => ({
        conversion: $convertAbbrElement,
        priority: 1,
      }),
    }
  }

  static override importJSON(serializedNode: SerializedAbbrNode): AbbrNode {
    const node = $createAbbrNode({
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
    const element = document.createElement('abbr')
    element.title = this.__fields.title ?? ''

    // addClassNamesToElement(element, config.theme.link)
    return element
  }

  override exportJSON(): SerializedAbbrNode {
    const fields = this.getFields()
    const returnObject: SerializedAbbrNode = {
      ...super.exportJSON(),
      type: 'abbr',
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

  getFields(): AbbrFields {
    return this.getLatest().__fields
  }

  getID(): string {
    return this.getLatest().__id
  }

  override insertNewAfter(selection: RangeSelection, restoreSelection = true): ElementNode | null {
    const element = this.getParentOrThrow().insertNewAfter(selection, restoreSelection)
    if ($isElementNode(element)) {
      const linkNode = $createAbbrNode({ fields: this.__fields })
      element.append(linkNode)
      return linkNode
    }
    return null
  }

  override isInline(): true {
    return true
  }

  setFields(fields: AbbrFields): void {
    const writable = this.getWritable()
    writable.__fields = fields
  }

  override updateDOM(prevNode: AbbrNode, anchor: HTMLAnchorElement, config: EditorConfig): boolean {
    const title = this.__fields?.title
    if (title != null && title !== prevNode.__fields?.title) {
      anchor.title = title
    }

    return false
  }
}

function $convertAbbrElement(domNode: Node): DOMConversionOutput {
  let node: AbbrNode | null = null
  if (domNode.nodeName === 'ABBR' && 'getAttribute' in domNode) {
    const content = domNode.textContent
    if (content !== null && content !== '') {
      node = $createAbbrNode({
        id: randstr(),
        fields: {
          title: (domNode as HTMLElement).getAttribute('title') ?? '',
        },
      })
    }
  }
  return { node }
}

export function $createAbbrNode({ id, fields }: { fields: AbbrFields; id?: string }): AbbrNode {
  return $applyNodeReplacement(
    new AbbrNode({
      id: id ?? randstr(),
      fields,
    }),
  )
}

export function $isAbbrNode(node: LexicalNode | null | undefined): node is AbbrNode {
  return node instanceof AbbrNode
}

export const TOGGLE_ABBR_COMMAND: LexicalCommand<AbbrPayload | null> =
  createCommand('TOGGLE_ABBR_COMMAND')

export function $toggleAbbr(payload: ({ fields: AbbrFields } & AbbrPayload) | null): void {
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

      if ($isAbbrNode(parent)) {
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
    const linkNode: AbbrNode | null = $isAbbrNode(firstNode)
      ? firstNode
      : $getAbbrAncestor(firstNode)
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

  let prevParent: ElementNode | AbbrNode | null = null
  let abbrNode: AbbrNode | null = null

  nodes?.forEach((node) => {
    const parent = node.getParent()

    if (parent === abbrNode || parent === null || ($isElementNode(node) && !node.isInline())) {
      return
    }

    if ($isAbbrNode(parent)) {
      abbrNode = parent
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
      abbrNode = $createAbbrNode({ fields: payload.fields })

      if ($isAbbrNode(parent)) {
        if (node.getPreviousSibling() === null) {
          parent.insertBefore(abbrNode)
        } else {
          parent.insertAfter(abbrNode)
        }
      } else {
        node.insertBefore(abbrNode)
      }
    }

    if ($isAbbrNode(node)) {
      if (node.is(abbrNode)) {
        return
      }
      if (abbrNode !== null) {
        const children = node.getChildren()

        for (let i = 0; i < children.length; i += 1) {
          abbrNode.append(children[i]!)
        }
      }

      node.remove()
      return
    }

    if (abbrNode !== null) {
      abbrNode.append(node)
    }
  })
}

function $getAbbrAncestor(node: LexicalNode): AbbrNode | null {
  return $getAncestor(node, (ancestor) => $isAbbrNode(ancestor)) as AbbrNode
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
