import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues } from 'react-hook-form'

import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Required } from '../Required'

export const Select: React.FC<
  SelectField & {
    control: Control<FieldValues, any>
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
  }
> = ({ name, control, errors, label, options, required, defaultValue, width }) => {
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
            <SelectComponent onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={label} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map(({ label, value }) => {
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </SelectComponent>
            {errors[name] && <Error />}
          </FormItem>
        )}
      />
    </Width>
  )
}
