'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import Lightbox, {
  isImageFitCover,
  isImageSlide,
  RenderSlideProps,
  Slide,
  SlideImage,
  useLightboxProps,
  useLightboxState,
} from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import RichText from '../RichText'
import NextImage from 'next/image'
import type { Media as MediaData } from '@/payload-types'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

function isNextJsImage(
  slide: Slide,
): slide is SlideImage & Required<Pick<SlideImage, 'width' | 'height'>> {
  return isImageSlide(slide) && typeof slide.width === 'number' && typeof slide.height === 'number'
}

export default function NextJsImage({ slide, offset, rect }: RenderSlideProps) {
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps()

  const { currentIndex } = useLightboxState()

  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit)

  if (!isNextJsImage(slide)) return undefined

  const width = !cover
    ? Math.round(Math.min(rect.width, (rect.height / slide.height) * slide.width))
    : rect.width

  const height = !cover
    ? Math.round(Math.min(rect.height, (rect.width / slide.width) * slide.height))
    : rect.height

  return (
    <div style={{ position: 'relative', width, height }}>
      <NextImage
        fill
        alt={slide.alt ?? ''}
        title={slide.alt ?? ''}
        src={slide}
        loading="eager"
        draggable={false}
        style={{
          objectFit: cover ? 'cover' : 'contain',
          cursor: click ? 'pointer' : undefined,
        }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        onClick={offset === 0 ? () => click?.({ index: currentIndex }) : undefined}
      />
    </div>
  )
}

interface MediaContextValue {
  mediaArray: MediaData[]
  addMedia: (m: MediaData) => void
  updateMedia: (oldM: MediaData, newM: MediaData) => void
  removeMedia: (m: MediaData) => void
  getIndex: (m: MediaData) => number
  showIndex: (index: number) => void
}

const MediaContext = createContext<MediaContextValue | null>(null)

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(-1)
  const [mediaArray, setMediaArray] = useState<MediaData[]>([])
  const slides = mediaArray.map(
    (m): Slide => ({
      src: m.url!,
      alt: m.alt ?? undefined,
      width: m.width ?? undefined,
      height: m.height ?? undefined,
      srcSet: Object.values(m.sizes || {}).map((size) => ({
        src: size.url!,
        width: size.width!,
        height: size.height!,
      })),
      description: m.caption && <RichText data={m.caption} enableGutter={false} />,
    }),
  )

  const addMedia = useCallback((m: MediaData) => {
    setMediaArray((current) => [...current, m])
  }, [])

  const updateMedia = useCallback((oldM: MediaData, newM: MediaData) => {
    setMediaArray((current) => {
      const idx = current.indexOf(oldM)
      if (idx >= 0) {
        const copy = [...current]
        copy[idx] = newM
        return copy
      }
      return current
    })
  }, [])

  const removeMedia = useCallback((m: MediaData) => {
    setMediaArray((current) => current.filter((item) => item !== m))
  }, [])

  const getIndex = useCallback((m: MediaData) => mediaArray.indexOf(m), [mediaArray])

  return (
    <MediaContext.Provider
      value={{ mediaArray, addMedia, updateMedia, removeMedia, getIndex, showIndex: setIndex }}
    >
      {/* Existing child component with ref */}
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Captions, Zoom]}
        captions={{ descriptionTextAlign: 'center' }}
        zoom={{ scrollToZoom: true, maxZoomPixelRatio: 2 }}
        render={{ slide: NextJsImage }}
      />
      {children}
    </MediaContext.Provider>
  )
}

// The custom hook
export function useRegisterMedia(media: MediaData | undefined): () => void {
  const ctx = useContext(MediaContext)
  if (!ctx && media) {
    console.error('useRegisterMedia must be used within MediaProvider')
  }
  const { addMedia, updateMedia, removeMedia, getIndex, showIndex } = ctx ?? {}
  const mediaRef = useRef(media)

  useEffect(() => {
    if (!mediaRef.current || !addMedia) return
    addMedia(mediaRef.current)
    return () => {
      if (!mediaRef.current || !removeMedia) return
      removeMedia(mediaRef.current)
    }
  }, [addMedia, removeMedia])

  useEffect(() => {
    if (!media || !mediaRef.current || !updateMedia || mediaRef.current === media) return

    updateMedia(mediaRef.current, media)
    mediaRef.current = media
  }, [media, updateMedia])

  const callback = useCallback(() => {
    if (!mediaRef.current || !getIndex || !showIndex) return
    const index = getIndex(mediaRef.current)
    if (index !== undefined && index >= 0) {
      showIndex(index)
    }
  }, [getIndex, showIndex])

  return callback
}
