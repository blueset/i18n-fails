'use client'

import { $findMatchingParent } from '@payloadcms/richtext-lexical/lexical/utils'
import { ToolbarGroup } from '@payloadcms/richtext-lexical'
import {
  createClientFeature,
  getSelectedNode,
  toolbarFeatureButtonsGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import { WholeWordIcon } from 'lucide-react'
import { $isAbbrNode, AbbrFields, AbbrNode } from './node'
import { FloatingAbbrEditorPlugin } from './editor'
import { $getSelection, $isRangeSelection, LexicalNode } from '@payloadcms/richtext-lexical/lexical'
import { TOGGLE_ABBR_WITH_MODAL_COMMAND } from './commands'
import { AbbrPlugin } from './plugin'

export type ClientProps = {
  title?: string
}

const toolbarGroups: ToolbarGroup[] = [
  toolbarFeatureButtonsGroupWithItems([
    {
      ChildComponent: () => <WholeWordIcon size={20} className="icon" />,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          const selectedNode = getSelectedNode(selection)
          const linkParent = $findMatchingParent(selectedNode, $isAbbrNode)
          return linkParent != null
        }
        return false
      },
      isEnabled: ({ selection }) => {
        return !!($isRangeSelection(selection) && $getSelection()?.getTextContent()?.length)
      },
      key: 'abbr',
      label: 'Abbrieviation',
      onSelect: ({ editor, isActive }) => {
        if (!isActive) {
          let selectedText: string | undefined
          let selectedNodes: LexicalNode[] = []
          editor.getEditorState().read(() => {
            selectedText = $getSelection()?.getTextContent()
            // We need to selected nodes here before the drawer opens, as clicking around in the drawer may change the original selection
            selectedNodes = $getSelection()?.getNodes() ?? []
          })

          if (!selectedText?.length) {
            return
          }

          const abbrFields: Partial<AbbrFields> = {}

          editor.dispatchCommand(TOGGLE_ABBR_WITH_MODAL_COMMAND, {
            fields: abbrFields,
            selectedNodes,
            text: selectedText,
          })
        }
      },
      order: 1,
    },
  ]),
]

export const AbbrFeatureClient = createClientFeature({
  nodes: [AbbrNode],
  plugins: [
    {
      Component: AbbrPlugin,
      position: 'normal',
    },
    {
      Component: FloatingAbbrEditorPlugin,
      position: 'floatingAnchorElem',
    },
  ],
  toolbarFixed: {
    groups: toolbarGroups,
  },
  toolbarInline: {
    groups: toolbarGroups,
  },
})
