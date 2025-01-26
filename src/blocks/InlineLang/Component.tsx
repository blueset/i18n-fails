import React from 'react'

import RichText from '@/components/RichText'
import { InlineLanguageBlock } from '@/payload-types'

export const InlineLangBlock: React.FC<InlineLanguageBlock> = ({ language, richText }) => {
  return (
    <span lang={language}>{richText && <RichText data={richText} enableGutter={false} />}</span>
  )
}
