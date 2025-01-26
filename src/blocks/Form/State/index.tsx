import type { StateField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'
import { stateOptions } from './options'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Required } from '../Required'

export const State: React.FC<
  StateField & {
    control: Control<FieldValues, any>
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
  }
> = ({ name, control, errors, label, required, defaultValue, width }) => {
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={label} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {stateOptions.map(({ label, value }) => {
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors[name] && <Error />}
          </FormItem>
        )}
      />
    </Width>
  )
}
