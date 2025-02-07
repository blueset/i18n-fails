'use client'

import { Button, fieldBaseClass, SelectInput, toast } from '@payloadcms/ui'
import { cn } from '@/utilities/ui'
import classes from './index.module.scss'
import { useState } from 'react'

export function ResaveCollection() {
  const [collection, setCollection] = useState('media')

  return (
    <form
      className={classes.form}
      onSubmit={async (e) => {
        e.preventDefault()
        const res = await fetch('/next/resaveCollection', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ collection }),
        })
        if (res.ok) {
          toast.success('Collection resaved')
        } else {
          toast.error('An error occurred while resaving collection')
        }
      }}
    >
      <div className={cn(fieldBaseClass)}>
        <label className="field-label">Resave collection</label>
        <div className={classes.row}>
          <SelectInput
            name="type"
            path="type"
            value={collection}
            required
            onChange={(e) =>
              setCollection((Array.isArray(e) ? (e[0]?.value ?? '') : e.value) as string)
            }
            options={[
              { label: 'Media', value: 'media' },
              { label: 'Languages', value: 'languages' },
              { label: 'Categories', value: 'categories' },
              { label: 'Pages', value: 'pages' },
              { label: 'Posts', value: 'posts' },
            ]}
          />
          <Button type="submit" className={classes.submit} buttonStyle="secondary">
            Resave
          </Button>
        </div>
      </div>
    </form>
  )
}
