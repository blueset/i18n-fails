import React from 'react'

import RichText from '@/components/RichText'

interface InlineLanguageBlockType {
  language: string
  richText?: any
}

export const InlineLangBlock: React.FC<InlineLanguageBlockType> = ({ language, richText }) => {
  return (
    <span lang={language}>{richText && <RichText data={richText} enableGutter={false} />}</span>
  )
}
