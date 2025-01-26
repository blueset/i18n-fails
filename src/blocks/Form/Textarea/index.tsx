import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { Textarea as TextAreaComponent } from '@/components/ui/textarea'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Required } from '../Required'

export const Textarea: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    control: Control<FieldValues, any>
    register: UseFormRegister<FieldValues>
    rows?: number
  }
> = ({ name, defaultValue, errors, label, register, required, control, rows = 3, width }) => {
  return (
    <Width width={width}>
      <FormField
        control={control}
        name={name}
        defaultValue={defaultValue}
        rules={{ required }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {label} {required && <Required />}
            </FormLabel>
            <FormControl>
              <TextAreaComponent rows={rows} required={required} {...field} />
            </FormControl>
            {errors[name] && <Error />}
          </FormItem>
        )}
      />
    </Width>
  )
}
