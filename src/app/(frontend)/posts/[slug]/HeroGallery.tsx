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
        <div className="text-sm text-muted-foreground">�</div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <Button variant="link" size="clear" className="text-md" asChild>
        <Link href={`/languages/${language.slug}`}>{language.name}</Link>
      </Button>
      <div className="text-sm text-muted-foreground" lang={language.code}>
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
    <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-1 flex flex-col gap-8">
      <div>
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <div className="grow w-0">
            <div className="font-semilight text-sm mb-1">From</div>
            <LanguageLabel language={sourceLanguage} />
          </div>
          <ArrowRightIcon className="mt-6 mb-6 hidden md:block" />
          <div className="grow w-0 md:text-right">
            <div className="font-semilight text-sm">To</div>
            <div className="flex flex-row flex-wrap gap-8 md:justify-end">
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
    <div className="col-start-1 col-span-1 md:col-start-1 grid md:col-span-3 md:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8">
        <div>
          <div className="font-semilight text-sm mb-1">From</div>
          <div className="flex justify-between items-center flex-row">
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
          <div className="font-semilight text-sm mb-1">To</div>
          <div className="flex flex-row flex-wrap gap-8 md:justify-end">
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
    <div className="container lg:grid lg:grid-cols-[1fr_48rem_1fr] pb-8">
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
