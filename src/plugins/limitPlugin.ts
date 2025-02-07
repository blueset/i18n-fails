import { CollectionConfig, Config } from 'payload'

export function limitPlugin(config: Config): Config {
  const preferenceCollection: CollectionConfig<'payload-preferences'> | undefined =
    config.collections?.find((collection) => collection.slug === 'payload-preferences')
  if (preferenceCollection) {
    if (!preferenceCollection.hooks) {
      preferenceCollection.hooks = {}
    }
    if (!preferenceCollection.hooks.beforeChange) {
      preferenceCollection.hooks.beforeChange = []
    }
    preferenceCollection.hooks.beforeChange.push((req) => {
      if (
        (req.operation === 'update' || req.operation === 'create') &&
        req.data?.value?.limit === 1
      ) {
        req.data.value.limit = 50
      }
      return req
    })
  }
  return config
}
