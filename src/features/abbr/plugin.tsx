'use client'

import { PluginComponent } from '@payloadcms/richtext-lexical'
import { COMMAND_PRIORITY_LOW } from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { mergeRegister } from '@payloadcms/richtext-lexical/lexical/utils'
import { useEffect } from 'react'
import { ClientProps } from './client'
import { $toggleAbbr, AbbrFields, AbbrNode, TOGGLE_ABBR_COMMAND } from './node'
import { AbbrPayload } from './commands'

export const AbbrPlugin: PluginComponent<ClientProps> = ({ clientProps }) => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([AbbrNode])) {
      throw new Error('LinkPlugin: AbbrNode not registered on editor')
    }
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_ABBR_COMMAND,
        (payload: AbbrPayload) => {
          if (payload === null) {
            $toggleAbbr(null)
            return true
          }
          if (!payload.fields?.title) {
            payload.fields.title = ''
          }
          $toggleAbbr(payload as { fields: AbbrFields } & AbbrPayload)
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  return null
}
