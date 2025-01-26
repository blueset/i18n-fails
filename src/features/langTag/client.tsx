'use client'

import { $findMatchingParent } from '@payloadcms/richtext-lexical/lexical/utils'
import { ToolbarGroup } from '@payloadcms/richtext-lexical'
import {
  createClientFeature,
  getSelectedNode,
  toolbarFeatureButtonsGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import { LanguagesIcon } from 'lucide-react'
import { $isLangTagNode, LangTagFields, LangTagNode } from './node'
import { FloatingLangTagEditorPlugin } from './editor'
import { $getSelection, $isRangeSelection, LexicalNode } from '@payloadcms/richtext-lexical/lexical'
import { TOGGLE_LANG_TAG_WITH_MODAL_COMMAND } from './commands'
import { LangTagPlugin } from './plugin'

export type ClientProps = {
  title?: string
}

const toolbarGroups: ToolbarGroup[] = [
  toolbarFeatureButtonsGroupWithItems([
    {
      ChildComponent: () => <LanguagesIcon size={20} className="icon" />,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          const selectedNode = getSelectedNode(selection)
          const linkParent = $findMatchingParent(selectedNode, $isLangTagNode)
          return linkParent != null
        }
        return false
      },
      isEnabled: ({ selection }) => {
        return !!($isRangeSelection(selection) && $getSelection()?.getTextContent()?.length)
      },
      key: 'langTag',
      label: 'Language tag',
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

          const langTagFields: Partial<LangTagFields> = {}

          editor.dispatchCommand(TOGGLE_LANG_TAG_WITH_MODAL_COMMAND, {
            fields: langTagFields,
            selectedNodes,
            text: selectedText,
          })
        }
      },
      order: 1,
    },
  ]),
]

export const LangTagFeatureClient = createClientFeature({
  nodes: [LangTagNode],
  plugins: [
    {
      Component: LangTagPlugin,
      position: 'normal',
    },
    {
      Component: FloatingLangTagEditorPlugin,
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
