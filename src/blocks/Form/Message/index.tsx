import RichText from '@/components/RichText'
import React from 'react'

import { Width } from '../Width'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export const Message: React.FC<{ message: SerializedEditorState }> = ({ message }) => {
  return (
    <Width className="my-6" width="100">
      {message && <RichText data={message} enableGutter={false} />}
    </Width>
  )
}
