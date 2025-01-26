import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { Required } from '../Required'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'

export const Text: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    control: Control<FieldValues, any>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, required, width, control }) => {
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
              <Input type="text" required={required} {...field} />
            </FormControl>
            {errors[name] && <Error />}
          </FormItem>
        )}
      />
    </Width>
  )
}
