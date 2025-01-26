'use client'

import { PluginComponent } from '@payloadcms/richtext-lexical'
import { COMMAND_PRIORITY_LOW } from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { mergeRegister } from '@payloadcms/richtext-lexical/lexical/utils'
import { useEffect } from 'react'
import { ClientProps } from './client'
import { $toggleLangTag, LangTagFields, LangTagNode, TOGGLE_LANG_TAG_COMMAND } from './node'
import { LangTagPayload } from './commands'

export const LangTagPlugin: PluginComponent<ClientProps> = ({ clientProps }) => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([LangTagNode])) {
      throw new Error('LinkPlugin: LangTagNode not registered on editor')
    }
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_LANG_TAG_COMMAND,
        (payload: LangTagPayload) => {
          if (payload === null) {
            $toggleLangTag(null)
            return true
          }
          if (!payload.fields?.lang) {
            payload.fields.lang = ''
          }
          $toggleLangTag(payload as { fields: LangTagFields } & LangTagPayload)
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  return null
}
