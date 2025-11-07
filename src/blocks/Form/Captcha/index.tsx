import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'
import { Required } from '../Required'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Turnstile } from '@marsidev/react-turnstile'

export const Captcha: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    control: Control<FieldValues, any>
    register: UseFormRegister<FieldValues>
    provider: string
    apiKey: string
  }
> = ({ name, defaultValue, errors, label, required, width, control, apiKey, provider }) => {
  if (!required) return null
  if (provider !== 'turnstile') return null
  const siteKey = apiKey.split(',')[0]!
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
              <Turnstile
                siteKey={siteKey}
                onSuccess={(token) => field.onChange(token)}
                onExpire={() => field.onChange('')}
                options={{
                  action: 'i18nfails-formSubmission',
                  theme: 'dark',
                  responseField: true,
                  responseFieldName: field.name,
                }}
              />
            </FormControl>
            {errors[name] && <Error />}
          </FormItem>
        )}
      />
    </Width>
  )
}
