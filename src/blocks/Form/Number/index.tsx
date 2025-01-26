import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Required } from '../Required'
export const Number: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    control: Control<FieldValues, any>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, control, required, width }) => {
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
              <Input type="number" required={required} {...field} />
            </FormControl>
            {errors[name] && <Error />}
          </FormItem>
        )}
      />
    </Width>
  )
}
