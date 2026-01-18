import React from 'react'
import { InlineIconBlock as InlineIconBlockType } from '@/payload-types'
import { Icon } from '@iconify/react'

export const InlineIconBlock: React.FC<InlineIconBlockType> = ({ icon }) => {
  return <Icon icon={icon} style={{ display: 'inline-block' }} />
}
