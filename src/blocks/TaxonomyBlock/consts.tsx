import type { TaxonomyBlock as TaxonomyBlockProps } from '@/payload-types'

export type TaxonomyType = Exclude<TaxonomyBlockProps['taxonomiesToShow'], null | undefined>[number]

export const taxonomyUrlSlugMapping = {
  vendors: 'vendors',
  products: 'products',
  languages: 'languages',
  sourceLanguages: 'source-languages',
  targetLanguages: 'target-languages',
  categories: 'categories',
} as const satisfies Record<TaxonomyType, string>

export const taxonomyCollectionMapping = {
  vendors: 'products',
  products: 'products',
  languages: 'languages',
  sourceLanguages: 'languages',
  targetLanguages: 'languages',
  categories: 'categories',
} as const satisfies Record<TaxonomyType, string>

export const taxonomyNameMapping = {
  vendors: 'Vendors',
  products: 'Products',
  languages: 'Languages',
  sourceLanguages: 'Source languages',
  targetLanguages: 'Target languages',
  categories: 'Tags',
} as const satisfies Record<TaxonomyType, string>
