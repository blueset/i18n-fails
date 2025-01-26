import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { siteDescription, siteTitle } from './constants'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: siteDescription,
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: siteTitle,
  title: siteTitle,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
