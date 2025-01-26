'use client'

import { RelationshipField, useRowLabel } from '@payloadcms/ui'

type RelationshipFieldProps = React.ComponentProps<typeof RelationshipField>

export function DebugComp(props: RelationshipFieldProps) {
  // console.log('DEBUG COMP', props, '<<-- props')
  return <RelationshipField {...props} />
}

export const RelevantLinkRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()

  return (
    <div>
      {rowNumber}: {data.title || 'Link'}
    </div>
  )
}
