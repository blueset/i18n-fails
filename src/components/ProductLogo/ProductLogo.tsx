import { Product } from '@/payload-types'
import { ImageMedia } from '../Media/ImageMedia'
import { cn } from '@/utilities/ui'

export function ProductLogo({ product, className }: { product: Product; className?: string }) {
  if (!product.logo) return null
  return (
    <ImageMedia
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjODA4MDgwIiBkPSJNOC43NSAxM0EyLjI1IDIuMjUgMCAwIDEgMTEgMTUuMjV2My41QTIuMjUgMi4yNSAwIDAgMSA4Ljc1IDIxaC0zLjVBMi4yNSAyLjI1IDAgMCAxIDMgMTguNzV2LTMuNUEyLjI1IDIuMjUgMCAwIDEgNS4yNSAxM3ptMTAtMTBBMi4yNSAyLjI1IDAgMCAxIDIxIDUuMjV2My41QTIuMjUgMi4yNSAwIDAgMSAxOC43NSAxMWgtMy41QTIuMjUgMi4yNSAwIDAgMSAxMyA4Ljc1di0zLjVBMi4yNSAyLjI1IDAgMCAxIDE1LjI1IDN6IiBjbGFzcz0iZHVvaWNvbi1zZWNvbmRhcnktbGF5ZXIiIG9wYWNpdHk9IjAuMyIvPjxwYXRoIGZpbGw9IiM4MDgwODAiIGQ9Ik04Ljc1IDNBMi4yNSAyLjI1IDAgMCAxIDExIDUuMjV2My41QTIuMjUgMi4yNSAwIDAgMSA4Ljc1IDExaC0zLjVBMi4yNSAyLjI1IDAgMCAxIDMgOC43NXYtMy41QTIuMjUgMi4yNSAwIDAgMSA1LjI1IDN6IiBjbGFzcz0iZHVvaWNvbi1wcmltYXJ5LWxheWVyIi8+PHBhdGggZmlsbD0iIzgwODA4MCIgZD0iTTE4Ljc1IDEzQTIuMjUgMi4yNSAwIDAgMSAyMSAxNS4yNXYzLjVBMi4yNSAyLjI1IDAgMCAxIDE4Ljc1IDIxaC0zLjVBMi4yNSAyLjI1IDAgMCAxIDEzIDE4Ljc1di0zLjVBMi4yNSAyLjI1IDAgMCAxIDE1LjI1IDEzeiIgY2xhc3M9ImR1b2ljb24tc2Vjb25kYXJ5LWxheWVyIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4="
      resource={product.logo}
      imgClassName={cn('object-contain', className)}
    />
  )
}
