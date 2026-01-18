'use client'
import type { LexicalBlockLabelClientProps } from '@payloadcms/richtext-lexical'
import { Icon } from '@iconify/react'

import { useFormFields } from '@payloadcms/ui'

export const InlineIconLabel: React.FC<LexicalBlockLabelClientProps> = () => {
  const icon = useFormFields(([fields]) => fields.icon?.value)

  return <Icon icon={icon as string} style={{ display: 'inline-block' }} />
}
