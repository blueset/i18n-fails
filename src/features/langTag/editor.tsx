'use client'

import type { Data, FormState } from 'payload'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { EditIcon, formatDrawerSlug, useEditDepth, XIcon } from '@payloadcms/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { $isLangTagNode, LangTagFields, TOGGLE_LANG_TAG_COMMAND } from './node'
import {
  FieldsDrawer,
  getSelectedNode,
  setFloatingElemPositionForLinkEditor,
  useEditorConfigContext,
  useLexicalDrawer,
} from '@payloadcms/richtext-lexical/client'
import { LanguagesIcon } from 'lucide-react'
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
import { LangTagPayload, TOGGLE_LANG_TAG_WITH_MODAL_COMMAND } from './commands'
import { $findMatchingParent, mergeRegister } from '@payloadcms/richtext-lexical/lexical/utils'

function preventDefault(
  event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>,
): void {
  event.preventDefault()
}

export function LangTagEditor({
  anchorElem: anchorElem,
}: {
  anchorElem: HTMLElement
}): React.ReactNode {
  const [editor] = useLexicalComposerContext()

  const editorRef = useRef<HTMLDivElement | null>(null)
  const [langTagLang, setLangTagLang] = useState<null | string>(null)

  const { fieldProps, uuid } = useEditorConfigContext()
  const schemaPath = fieldProps?.schemaPath

  const [stateData, setStateData] = useState<
    ({ id?: string; text: string } & LangTagFields) | undefined
  >()

  const editDepth = useEditDepth()
  const [isLangTag, setIsLangTag] = useState(false)
  const [selectedNodes, setSelectedNodes] = useState<LexicalNode[]>([])

  const drawerSlug = formatDrawerSlug({
    slug: `lexical-rich-text-langTag-` + uuid,
    depth: editDepth,
  })

  const { toggleDrawer } = useLexicalDrawer(drawerSlug)

  const setNotLangTag = useCallback(() => {
    setIsLangTag(false)
    if (editorRef && editorRef.current) {
      editorRef.current.style.opacity = '0'
      editorRef.current.style.transform = 'translate(-10000px, -10000px)'
    }
    setLangTagLang(null)
    setSelectedNodes([])
    setStateData(undefined)
  }, [setLangTagLang, setSelectedNodes])

  const $updateLangTagEditor = useCallback(() => {
    const selection = $getSelection()
    let selectedNodeDomRect: DOMRect | undefined

    if (!$isRangeSelection(selection) || !selection) {
      void setNotLangTag()
      return
    }

    // Handle the data displayed in the floating link editor & drawer when you click on a link node

    const focusNode = getSelectedNode(selection)
    selectedNodeDomRect = editor.getElementByKey(focusNode.getKey())?.getBoundingClientRect()
    const focusLangTagParent = $findMatchingParent(focusNode, $isLangTagNode)

    // Prevent link modal from showing if selection spans further than the link: https://github.com/facebook/lexical/issues/4064
    const badNode = selection
      .getNodes()
      .filter((node) => !$isLineBreakNode(node))
      .find((node) => {
        const langTagNode = $findMatchingParent(node, $isLangTagNode)
        return (
          (focusLangTagParent && !focusLangTagParent.is(langTagNode)) ||
          (langTagNode && !langTagNode.is(focusLangTagParent))
        )
      })

    if (focusLangTagParent == null || badNode) {
      setNotLangTag()
      return
    }

    const fields = focusLangTagParent.getFields()

    // Initial state:
    const data: { text: string } & LangTagFields = {
      ...fields,
      id: focusLangTagParent.getID(),
      text: focusLangTagParent.getTextContent(),
    }

    setLangTagLang(fields?.lang ?? null)

    setStateData(data)
    setIsLangTag(true)
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
      setLangTagLang(null)
    }

    return true
  }, [editor, setNotLangTag, anchorElem])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_LANG_TAG_WITH_MODAL_COMMAND,
        (payload: LangTagPayload) => {
          editor.dispatchCommand(TOGGLE_LANG_TAG_COMMAND, payload)

          // Now, open the modal
          $updateLangTagEditor()
          toggleDrawer()

          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, $updateLangTagEditor, toggleDrawer, drawerSlug])

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement

    const update = (): void => {
      editor.getEditorState().read(() => {
        void $updateLangTagEditor()
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
  }, [anchorElem.parentElement, editor, $updateLangTagEditor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          void $updateLangTagEditor()
        })
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          void $updateLangTagEditor()
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLangTag) {
            setNotLangTag()

            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor, $updateLangTagEditor, isLangTag, setNotLangTag])

  useEffect(() => {
    editor.getEditorState().read(() => {
      void $updateLangTagEditor()
    })
  }, [editor, $updateLangTagEditor])

  return (
    <React.Fragment>
      <div className="link-editor" ref={editorRef}>
        <div className="link-input">
          <div style={{ marginRight: '4px' }}>
            <LanguagesIcon size={20} color="currentcolor" />
          </div>
          {langTagLang && langTagLang.length > 0 ? langTagLang : '-'}
          {editor.isEditable() && (
            <React.Fragment>
              <button
                aria-label="Edit language tag"
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
                aria-label="Clear language tag"
                className="link-edit"
                onClick={(event) => {
                  event.preventDefault()
                  editor.dispatchCommand(TOGGLE_LANG_TAG_COMMAND, null)
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
        drawerTitle="Edit language tag"
        featureKey="langTag"
        handleDrawerSubmit={(fields: FormState, data: Data) => {
          const newLinkPayload = data as { text: string } & LangTagFields

          const bareLangTagFields: LangTagFields = {
            ...newLinkPayload,
          }

          if (bareLangTagFields.lang) {
            editor.dispatchCommand(TOGGLE_LANG_TAG_COMMAND, {
              fields: bareLangTagFields,
              selectedNodes,
              text: newLinkPayload.text,
            })
          } else {
            editor.dispatchCommand(TOGGLE_LANG_TAG_COMMAND, null)
            setNotLangTag()
          }
        }}
        schemaPath={schemaPath}
        schemaPathSuffix="fields"
      />
    </React.Fragment>
  )
}

export const FloatingLangTagEditorPlugin: PluginComponentWithAnchor<ClientProps> = (props) => {
  const { anchorElem = document.body } = props

  return createPortal(<LangTagEditor anchorElem={anchorElem} />, anchorElem)
}
