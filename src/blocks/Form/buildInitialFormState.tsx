import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
type ExtendedFormFieldBlock =
  | FormFieldBlock
  | {
      blockName?: string
      blockType: 'number'
      defaultValue?: string
      label?: string
      name: string
      required?: boolean
      width?: number
    }

export const buildInitialFormState = (fields: ExtendedFormFieldBlock[]) => {
  return fields?.reduce((initialSchema, field) => {
    if (field.blockType === 'checkbox') {
      return {
        ...initialSchema,
        [field.name]: field.defaultValue,
      }
    }
    if (field.blockType === 'country') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'email') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'text') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'select') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'state') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'number') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'textarea') {
      return {
        ...initialSchema,
        [field.name]: '',
      }
    }
    if (field.blockType === 'message') {
      return {
        ...initialSchema,
      }
    }
    if (field.blockType === 'captcha') {
      return {
        ...initialSchema,
      }
    }
    throw new Error(`invalid blocktype: ${field.blockType}`)
  }, {})
}
