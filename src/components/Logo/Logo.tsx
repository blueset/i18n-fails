import clsx from 'clsx'
import React from 'react'
import NextImage from 'next/image'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    // <SvgLogo className={clsx('max-w-[9.375rem] w-full h-[34px]', className)} />
    // /* eslint-disable @next/next/no-img-element */
    <NextImage
      alt="1A23 Studio"
      width={80}
      height={34}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      unoptimized
      className={clsx('max-w-[9.375rem] w-full h-[34px]', className)}
      // src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg"
      src="/logo.svg"
    />
  )
}
