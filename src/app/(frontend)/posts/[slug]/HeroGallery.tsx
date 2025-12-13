import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { Button } from '@/components/ui/button'
import { Language, Media, Post } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

function LanguageLabel({ language }: { language?: Language | null }) {
  if (!language) {
    return (
      <div className="flex flex-col gap-1">
        <Button variant="link" size="clear" className="text-md" disabled>
          Unknown language
        </Button>
        <div className="text-muted-foreground text-sm">�</div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <Button variant="link" size="clear" className="text-md" asChild>
        <Link href={`/languages/${language.slug}`}>{language.name}</Link>
      </Button>
      <div className="text-muted-foreground text-sm" lang={language.code}>
        {language.nativeName}
      </div>
    </div>
  )
}

function RenderOneGallery({
  images,
  sourceLanguage,
  destinationLanguages,
}: {
  sourceLanguage: Language | null
  destinationLanguages: Language[]
  images: Media[]
}) {
  return (
    <div className="flex flex-col gap-8 col-span-1 md:col-span-1 col-start-1 md:col-start-2">
      <div>
        <div className="flex flex-row flex-wrap md:justify-between gap-8">
          <div className="md:w-0 grow">
            <div className="mb-1 font-semilight text-sm">From</div>
            <LanguageLabel language={sourceLanguage} />
          </div>
          <ArrowRightIcon className="hidden md:block mt-6 mb-6" />
          <div className="md:w-0 md:text-right grow">
            <div className="font-semilight text-sm">To</div>
            <div className="flex flex-row flex-wrap md:justify-end gap-8">
              {destinationLanguages?.length ? (
                destinationLanguages.map((l) => <LanguageLabel key={l.id} language={l} />)
              ) : (
                <LanguageLabel />
              )}
            </div>
          </div>
        </div>
      </div>
      {images.map((image) => (
        <MediaBlock
          key={image.id}
          blockType="mediaBlock"
          className="p-0"
          imgClassName="mx-auto"
          captionClassName="p-0"
          media={image}
        />
      ))}
    </div>
  )
}

function RenderTwoGalleries({
  sourceImages,
  destinationImages,
  sourceLanguage,
  destinationLanguages,
}: {
  sourceLanguage: Language | null
  destinationLanguages: Language[] | null
  sourceImages: Media[]
  destinationImages: Media[]
}) {
  return (
    <div className="gap-8 grid md:grid-cols-2 col-span-1 md:col-span-3 col-start-1 md:col-start-1">
      <div className="flex flex-col gap-8">
        <div>
          <div className="mb-1 font-semilight text-sm">From</div>
          <div className="flex flex-row justify-between items-center">
            <div>
              <LanguageLabel language={sourceLanguage} />
            </div>
            <ArrowRightIcon className="hidden md:block -mr-7" />
          </div>
        </div>
        {sourceImages.map((image) => (
          <MediaBlock
            key={image.id}
            blockType="mediaBlock"
            className="p-0"
            imgClassName="mx-auto md:mr-auto md:ml-0"
            captionClassName="p-0"
            media={image}
          />
        ))}
      </div>
      <div className="flex flex-col gap-8">
        <div className="md:text-right">
          <div className="mb-1 font-semilight text-sm">To</div>
          <div className="flex flex-row flex-wrap md:justify-end gap-8">
            {destinationLanguages?.length ? (
              destinationLanguages.map((l) => <LanguageLabel key={l.id} language={l} />)
            ) : (
              <LanguageLabel />
            )}
          </div>
        </div>
        {destinationImages.map((image) => (
          <MediaBlock
            key={image.id}
            blockType="mediaBlock"
            className="p-0"
            imgClassName="mx-auto md:ml-auto md:mr-0"
            captionClassName="p-0 md:text-right"
            media={image}
          />
        ))}
      </div>
    </div>
  )
}

export const HeroGallery: React.FC<{
  post: Post
}> = ({ post }) => {
  const sourceLanguage = typeof post?.sourceLanguage === 'object' ? post.sourceLanguage : null
  const destinationLanguages =
    post?.destinationLanguages?.filter((l) => typeof l === 'object') ?? []
  const sourceImages = post?.sourceImages?.filter((i) => typeof i === 'object') ?? []
  const destinationImages = post?.destinationImages?.filter((i) => typeof i === 'object') ?? []

  const hasBothImages = sourceImages.length && destinationImages.length

  return (
    <div className="lg:grid lg:grid-cols-[1fr_48rem_1fr] pb-8 container">
      {hasBothImages ? (
        <RenderTwoGalleries
          sourceImages={sourceImages}
          destinationImages={destinationImages}
          sourceLanguage={sourceLanguage}
          destinationLanguages={destinationLanguages}
        />
      ) : (
        <RenderOneGallery
          images={sourceImages.length ? sourceImages : destinationImages}
          sourceLanguage={sourceLanguage}
          destinationLanguages={destinationLanguages}
        />
      )}
    </div>
  )
}
