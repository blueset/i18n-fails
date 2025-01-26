'use client'

import type { Data, FormState } from 'payload'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { EditIcon, formatDrawerSlug, useEditDepth, XIcon } from '@payloadcms/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { $isAbbrNode, AbbrFields, TOGGLE_ABBR_COMMAND } from './node'
import {
  FieldsDrawer,
  getSelectedNode,
  setFloatingElemPositionForLinkEditor,
  useEditorConfigContext,
  useLexicalDrawer,
} from '@payloadcms/richtext-lexical/client'
import { WholeWordIcon } from 'lucide-react'
import { PluginComponentWithAnchor } from '@payloadcms/richtext-lexical'
import { ClientProps } from './client'
import { createPortal } from 'react-dom'
import {
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  getDOMSelection,
  KEY_ESCAPE_COMMAND,
  LexicalNode,
  SELECTION_CHANGE_COMMAND,
} from '@payloadcms/richtext-lexical/lexical'
import { AbbrPayload, TOGGLE_ABBR_WITH_MODAL_COMMAND } from './commands'
import { $findMatchingParent, mergeRegister } from '@payloadcms/richtext-lexical/lexical/utils'

function preventDefault(
  event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>,
): void {
  event.preventDefault()
}

export function AbbrEditor({
  anchorElem: anchorElem,
}: {
  anchorElem: HTMLElement
}): React.ReactNode {
  const [editor] = useLexicalComposerContext()

  const editorRef = useRef<HTMLDivElement | null>(null)
  const [abbrTitle, setAbbrTitle] = useState<null | string>(null)

  const { fieldProps, uuid } = useEditorConfigContext()
  const schemaPath = fieldProps?.schemaPath

  const [stateData, setStateData] = useState<
    ({ id?: string; text: string } & AbbrFields) | undefined
  >()

  const editDepth = useEditDepth()
  const [isAbbr, setIsAbbr] = useState(false)
  const [selectedNodes, setSelectedNodes] = useState<LexicalNode[]>([])

  const drawerSlug = formatDrawerSlug({
    slug: `lexical-rich-text-abbr-` + uuid,
    depth: editDepth,
  })

  const { toggleDrawer } = useLexicalDrawer(drawerSlug)

  const setNotAbbr = useCallback(() => {
    setIsAbbr(false)
    if (editorRef && editorRef.current) {
      editorRef.current.style.opacity = '0'
      editorRef.current.style.transform = 'translate(-10000px, -10000px)'
    }
    setAbbrTitle(null)
    setSelectedNodes([])
    setStateData(undefined)
  }, [setAbbrTitle, setSelectedNodes])

  const $updateAbbrEditor = useCallback(() => {
    const selection = $getSelection()
    let selectedNodeDomRect: DOMRect | undefined

    if (!$isRangeSelection(selection) || !selection) {
      void setNotAbbr()
      return
    }

    // Handle the data displayed in the floating link editor & drawer when you click on a link node

    const focusNode = getSelectedNode(selection)
    selectedNodeDomRect = editor.getElementByKey(focusNode.getKey())?.getBoundingClientRect()
    const focusAbbrParent = $findMatchingParent(focusNode, $isAbbrNode)

    // Prevent link modal from showing if selection spans further than the link: https://github.com/facebook/lexical/issues/4064
    const badNode = selection
      .getNodes()
      .filter((node) => !$isLineBreakNode(node))
      .find((node) => {
        const abbrNode = $findMatchingParent(node, $isAbbrNode)
        return (
          (focusAbbrParent && !focusAbbrParent.is(abbrNode)) ||
          (abbrNode && !abbrNode.is(focusAbbrParent))
        )
      })

    if (focusAbbrParent == null || badNode) {
      setNotAbbr()
      return
    }

    const fields = focusAbbrParent.getFields()

    // Initial state:
    const data: { text: string } & AbbrFields = {
      ...fields,
      id: focusAbbrParent.getID(),
      text: focusAbbrParent.getTextContent(),
    }

    setAbbrTitle(fields?.title ?? null)

    setStateData(data)
    setIsAbbr(true)
    setSelectedNodes(selection ? selection?.getNodes() : [])

    const editorElem = editorRef.current
    const nativeSelection = getDOMSelection(editor._window)
    const { activeElement } = document

    if (editorElem === null) {
      return
    }

    const rootElement = editor.getRootElement()

    if (
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      if (!selectedNodeDomRect) {
        // Get the DOM rect of the selected node using the native selection. This sometimes produces the wrong
        // result, which is why we use lexical's selection preferably.
        selectedNodeDomRect = nativeSelection.getRangeAt(0).getBoundingClientRect()
      }

      if (selectedNodeDomRect != null) {
        selectedNodeDomRect.y += 40
        setFloatingElemPositionForLinkEditor(selectedNodeDomRect, editorElem, anchorElem)
      }
    } else if (activeElement == null || activeElement.className !== 'link-input') {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem)
      }
      setAbbrTitle(null)
    }

    return true
  }, [editor, setNotAbbr, anchorElem])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_ABBR_WITH_MODAL_COMMAND,
        (payload: AbbrPayload) => {
          editor.dispatchCommand(TOGGLE_ABBR_COMMAND, payload)

          // Now, open the modal
          $updateAbbrEditor()
          toggleDrawer()

          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, $updateAbbrEditor, toggleDrawer, drawerSlug])

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement

    const update = (): void => {
      editor.getEditorState().read(() => {
        void $updateAbbrEditor()
      })
    }

    window.addEventListener('resize', update)

    if (scrollerElem != null) {
      scrollerElem.addEventListener('scroll', update)
    }

    return () => {
      window.removeEventListener('resize', update)

      if (scrollerElem != null) {
        scrollerElem.removeEventListener('scroll', update)
      }
    }
  }, [anchorElem.parentElement, editor, $updateAbbrEditor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          void $updateAbbrEditor()
        })
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          void $updateAbbrEditor()
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isAbbr) {
            setNotAbbr()

            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor, $updateAbbrEditor, isAbbr, setNotAbbr])

  useEffect(() => {
    editor.getEditorState().read(() => {
      void $updateAbbrEditor()
    })
  }, [editor, $updateAbbrEditor])

  return (
    <React.Fragment>
      <div className="link-editor" ref={editorRef}>
        <div className="link-input">
          <div style={{ marginRight: '4px' }}>
            <WholeWordIcon size={20} color="currentcolor" />
          </div>
          {abbrTitle && abbrTitle.length > 0 ? abbrTitle : '-'}
          {editor.isEditable() && (
            <React.Fragment>
              <button
                aria-label="Edit abbrieviation"
                className="link-edit"
                onClick={(event) => {
                  event.preventDefault()
                  toggleDrawer()
                }}
                onMouseDown={preventDefault}
                tabIndex={0}
                type="button"
              >
                <EditIcon />
              </button>
              <button
                aria-label="Clear abbrieviation"
                className="link-edit"
                onClick={(event) => {
                  event.preventDefault()
                  editor.dispatchCommand(TOGGLE_ABBR_COMMAND, null)
                }}
                onMouseDown={preventDefault}
                tabIndex={0}
                type="button"
              >
                <XIcon />
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
      <FieldsDrawer
        className="lexical-link-edit-drawer"
        data={stateData}
        drawerSlug={drawerSlug}
        drawerTitle="Edit Abbrieviation"
        featureKey="abbr"
        handleDrawerSubmit={(fields: FormState, data: Data) => {
          const newLinkPayload = data as { text: string } & AbbrFields

          const bareAbbrFields: AbbrFields = {
            ...newLinkPayload,
          }

          if (bareAbbrFields.title) {
            editor.dispatchCommand(TOGGLE_ABBR_COMMAND, {
              fields: bareAbbrFields,
              selectedNodes,
              text: newLinkPayload.text,
            })
          } else {
            editor.dispatchCommand(TOGGLE_ABBR_COMMAND, null)
            setNotAbbr()
          }
        }}
        schemaPath={schemaPath}
        schemaPathSuffix="fields"
      />
    </React.Fragment>
  )
}

export const FloatingAbbrEditorPlugin: PluginComponentWithAnchor<ClientProps> = (props) => {
  const { anchorElem = document.body } = props

  return createPortal(<AbbrEditor anchorElem={anchorElem} />, anchorElem)
}
