'use client'

import { Button, fieldBaseClass, SelectInput, toast } from '@payloadcms/ui'
import { cn } from '@/utilities/ui'
import classes from './index.module.scss'
import { useState } from 'react'

export function RevalidateCache() {
  const [path, setPath] = useState('/')
  const [type, setType] = useState('layout')
  return (
    <form
      className={classes.form}
      onSubmit={async (e) => {
        e.preventDefault()
        const res = await fetch('/api/revalidatePath', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path, type: type || undefined }),
        })
        if (res.ok) {
          toast.success('Cache revalidated')
        } else {
          toast.error('An error occurred while revalidating cache')
        }
      }}
    >
      <div className={cn(fieldBaseClass)}>
        <label className="field-label">Revalidate cache by path</label>
        <div className={classes.row}>
          <div className="field-type text">
            <input
              name="path"
              type="text"
              value={path}
              required
              onChange={(e) => setPath(e.target.value)}
              placeholder="path"
            />
          </div>
          <SelectInput
            name="type"
            path="type"
            value={type}
            required
            onChange={(e) => setType((Array.isArray(e) ? (e[0]?.value ?? '') : e.value) as string)}
            options={[
              { label: '-', value: '' },
              { label: 'Layout', value: 'layout' },
              { label: 'Page', value: 'page' },
            ]}
          />
          <Button type="submit" className={classes.submit} buttonStyle="secondary">
            Revalidate
          </Button>
        </div>
      </div>
    </form>
  )
}
