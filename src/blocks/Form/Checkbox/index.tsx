import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { useFormContext } from 'react-hook-form'

import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { FormField, FormItem, FormControl, FormLabel, FormDescription } from '@/components/ui/form'
import { Required } from '../Required'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    control: Control<FieldValues, any>
    getValues: any
    register: UseFormRegister<FieldValues>
    setValue: any
  }
> = ({ name, control, defaultValue, errors, label, required, width }) => {
  return (
    <Width width={width}>
      <FormField
        control={control}
        name={name}
        defaultValue={defaultValue}
        rules={{ required }}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <CheckboxUi checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                {label}
                {required && <Required />}
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
      {errors[name] && <Error />}
    </Width>
  )
}
