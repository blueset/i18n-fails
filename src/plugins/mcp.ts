import { convertHTMLToLexical, convertLexicalToHTML } from '@/fields/lexicalFormatters'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { PayloadRequest } from 'payload'
import { z } from 'zod'

interface ProductTreeNode {
  id: string
  slug: string
  name: string
  children?: ProductTreeNode[]
}

export const mcpPluginConfig = mcpPlugin({
  collections: {
    pages: {
      enabled: true,
      description: 'Website pages.',
    },
    posts: {
      enabled: true,
      description: 'Articles about individual i18nfails entries.',
    },
    products: {
      enabled: true,
      description:
        'Venders and product information in a nested structure. A product may be the root, under its vendor, or under a parent product (for product variants). Examples: Figma, Google/Google Play, Microsoft/Windows/Windows 11.',
    },
    media: {
      enabled: true,
      description: 'Media files uploaded to the Media Library.',
    },
    categories: {
      enabled: true,
      description: 'Categories for i18nfails entries.',
    },
    languages: {
      enabled: true,
      description: 'Languages for where a i18nfail happens.',
    },
  },
  mcp: {
    resources: [
      {
        name: 'getCategories',
        title: 'Categories available',
        description: 'Categories available for use in posts.',
        mimeType: 'application/json',
        uri: 'i18nfails:info/categories',
        handler: async (uri, req: PayloadRequest) => {
          const categories = await req.payloadDataLoader.find({
            collection: 'categories',
            req,
            limit: 100,
          })
          const docs = categories.docs.map((category) => {
            return {
              id: category.id,
              slug: category.slug,
              name: category.title,
              description: category.content && convertLexicalToHTML({ data: category.content }),
            }
          })
          return {
            contents: [
              {
                uri: uri.href,
                text: JSON.stringify(docs),
              },
            ],
          }
        },
      },
      {
        name: 'getProducts',
        title: 'Products available',
        description: 'Products available for use in posts.',
        mimeType: 'application/json',
        uri: 'i18nfails:info/products',
        handler: async (uri, req: PayloadRequest) => {
          const products = await req.payloadDataLoader.find({
            collection: 'products',
            req,
            limit: 100,
          })

          // Create a map of all products by id
          const productMap = new Map<string, ProductTreeNode>()
          for (const product of products.docs) {
            productMap.set(product.id, {
              id: product.id,
              slug: product.slug || '',
              name: product.title,
              children: [],
            })
          }

          // Build the tree structure
          const productTree: ProductTreeNode[] = []
          for (const product of products.docs) {
            const node = productMap.get(product.id)!
            const parentId =
              typeof product.parent === 'object' ? product.parent?.id : product.parent
            if (parentId && productMap.has(parentId)) {
              productMap.get(parentId)!.children!.push(node)
            } else {
              productTree.push(node)
            }
          }

          // Remove empty children arrays
          for (const node of productMap.values()) {
            if (node.children?.length === 0) {
              delete node.children
            }
          }

          return {
            contents: [
              {
                uri: uri.href,
                text: JSON.stringify(productTree),
              },
            ],
          }
        },
      },
    ],
    prompts: [
      {
        name: 'createProduct',
        title: 'Create Product',
        description: 'Create a new product in the Products collection.',
        argsSchema: {
          productName: z.string().min(1),
        },
        handler: (args) => {
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Create a new product entry for product “${args.productName}”.

First determine if the product needs to have a vendor or a parent product. View the existing products from Resource \`getProducts\` to see if there is a suitable vendor or parent product. If there is, create the new product under that vendor or parent product. If not, create the product as a root product.

If the vendor or parent product needs to be created, create that first, then create the new product under it.

Before creating the product (or its vendor/parent), try to look for a logo of the product online. If you find a suitable logo, include it as the "logo" field when creating the product. The logo should have a 1:1 square aspect ratio, and SVG format is preferred.

If you found an SVG logo, and the logo contains a black or white shape on a transparent background, modify the shape color to be adaptive to light/dark mode. For example, assign the path with a class (e.g. \`class="black"\` or \`class="white"\`), and add the following CSS to the SVG root:

\`\`\`
<style>.black { fill: #000; } .white { fill: #fff; } @media (prefers-color-scheme: dark) { .black { fill: #fff; } .white { fill: #000; } }</style>
\`\`\`

Logos need to have proper ALT text, usually in the format “Logo of [Product Name]”. Logos do not need to have captions.

All new products must have a name and a slug.
`,
                },
              },
            ],
          }
        },
      },
      {
        name: 'createPost',
        title: 'Create Post',
        description: 'Create a new post based on the provided screenshots.',
        argsSchema: {
          productName: z.string().min(1),
          sourceLanguage: z.string().min(1),
          externalLinks: z.string(),
        },
        handler: (args) => {
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Create a new post using the provided screenshots. If you do not see any screenshots, respond with "No screenshots provided" and do not create a post.

The post should be about an i18nfail in the product “${args.productName}”.

You should be able to read the content of the screenshots to understand the i18nfail. Use the text in the screenshots as part of the post content. If you are not capable of reading the text in the screenshots, respond with "Screenshots cannot be read” with your reasoning, and do not create a post.

# Title
The title should be a concise representation of the point where the i18nfail occurs. If the failure is about a mistranslation or translation lost context, and it is not in English, translate it to English while keeping the mistranslated meaning. If the failure is about layout, formatting, encoding, or other technical issues, you can have a non-English title.

Meta tilte should be the same as the title.

If the title is in a non-Latin script (e.g. Chinese, Japanese, Korean, Cyrillic, Arabic), provide a romanized version of the title in parentheses after the title. For example, if the title is in Chinese, provide the pinyin romanization. If the title is garbled text or mojibake, use slug \`mojibake-<index>\` where <index> is a the next available index starting from 0 (e.g. mojibake-0, mojibake-1, etc.). In this case, you will need to use a tool to query for the next available index.

# Subtilte (Meta description)
The subtitle should be a catchy subtitle that derives from the failure. It should be in English, unless the failure is about bad encoding, garbled text, missing strings, or broken placeholders, in which case it may be in garble text or internal placeholder names. It can be a one-line comment on the failure, a quirky remark, or a sarcastic comment.

# Meta image
The meta image should be one of the screenshots in the destination languages that best represents the i18nfail. If there are multiple destination languages, choose the one that has the most representative screenshot. If there is no suitable screenshot in the destination languages, use a screenshot in the source language.

\`meta\` field should be a JSON object with the following shape:
\`\`\`ts
{
  title: string; // same as post title
  description: string; // subtitle
  image: string; // ID of the meta image
}
\`\`\`

# Categories
Read resource \`getCategories\` to get the list of available categories. Assign one or more categories that best describe the i18nfail. The categories should be relevant to the failure, not just general categories about the product or language. You must read the screenshots to understand the failure and assign accurate categories.

# Source language
The source language of the i18nfail is “${args.sourceLanguage}”.
You may or may not have screenshots in the source language.

# Destination languages
The post may have one or more screenshots in zero or more destination languages.

If the failure is about broken placeholders or missing strings, and the internal names (i.e. not user-facing strings in the original language) are used for placeholders in the screenshots, this post have NO destination language.

Otherwise, identify the screenshots that are in a different language than the source language, and use those languages as the destination languages for the post.

# Screenshots
You are provided with one or more screenshots as context. Use the content of the screenshots to understand the i18nfail, and include relevant parts of the screenshots in the post content. You need to read the screenshots to determine if the screenshot is for the source language or a destination language.

Screenshots need do be uploaded as media in the Media Library, and included in the post content with proper ALT text and captions.

ALT text of screenshots should describe the parts of the screenshot that are relevant to the i18nfail, ALT text should be a transcription of the failure in the image content in the language as in the screenshot. ALT text may have more than one line for better formatting.

Captions of the screenshots should highlight what is the failure in English. Translate to the text to English if the caption is not in English. If the failure is about mistranslation or lost context, keep the mistranslated meaning in the caption. If the intended meaning and the actual meaning are written the same in English, you should find a way to make the mistranslation clear in English. Recommended strategies
- Paraphrase the mistranslated meaning so that it is different from the intended meaning
- Use an emoji next to the words that can assist in distinguishing the intended meaning and the actual meaning (e.g. Space 🌌 / Space ⌨️)
- Use parentheses or other textual notations to clarify the intended meaning (e.g. Use for new(ly opened) windows / Use for new Windows®)
- Other ways to make the mistranslation clear

# Post Content
Post content is not necessary if the screenshots and captions sufficiently explain the i18nfail. However, if additional context is needed, you can add a short paragraph before or after the screenshots to explain the situation. The post content can also include relevant knowledge about the failure that an average English reader may not know.

# External Links (\`relevantLinks\`)
${
  args.externalLinks
    ? 'Include the following external links in the post: \n' +
      args.externalLinks +
      '\n\n' +
      '`relevantLinks` should be provided as a JSON of the following shape:\n' +
      '```ts\n' +
      '{\n' +
      '    url: string;\n' +
      '    title: string;\n' +
      '    /** ID of the link, a random 24-character hex string */\n' +
      '    id: string;\n' +
      '}\n' +
      '```\n'
    : 'No external links are needed.'
}

# General instructions
- Captions and post contents, if present, should be formatted in Lexical rich text JSON format. You must use the \`htmlToLexical\` tool to convert from HTML to Lexical rich text JSON format.
- In rich text context, if you include any non-English text, use 
- Create the post in draft state only, and present it to the user for review before publishing.
- Joined fields (categories, source language, destination languages, source language screenshots, destination language screenshots) should be provided in ID or array of IDs. Use tools to look up these IDs.

# Example posts

> Title: Space
> Subtitle: Keyboards are actually nice to use as wallpapers, don’t you think?
> Categories: Mistranslation
> Product: Microsoft / Bing Wallpapers
> Source language: English (United States)
> Destination language: Chinese (Simplified)
> Source language screenshot 0 ALT text:
> > Bing Wallpaper Library
> > Selected category: Space
> Source language screenshot 0 caption: Space 🌌
> Destination language screenshot 0 ALT text:
> > Bing Wallpapers
> > 选择类别：空格
> Destination language screenshot 0 caption: Space ⌨️

> Title: Is Shift+Insert a secure key?
> Subtitle: Of course it’s not.
> Categories: Lost context
> Product: Microsoft / Windows Terminal
> Source language: English (United States)
> Destination language: Chinese (Simplified)
> Source language screenshot 0 ALT text:
> > Dialog: Are you sure you want to delete this key binding?
> > Button: Yes, delete key binding
> Source language screenshot 0 caption: Key (keyboard button)
> Destination language screenshot 0 ALT text:
> > 对话框：是否确实要删除此密钥绑定？
> > 按钮：是，删除密钥绑定
> Destination language screenshot 0 caption: Key (secret credential)

> Title: Cookie
> Subtitle: Yummy, I wonder if they’d share some… 🍪
> Categories: Mistranslation, Inconsistency
> Product: Transcend
> Source language: English (United States)
> Destination language: Chinese (Simplified)
> Source language screenshot 0 ALT text:
> > We use cookies
> > By clicking “Accept all”, you agree to the storing of cookies on your device for functional, analytics, and advertising purposes.
> Source language screenshot 0 caption: We use cookies 📃
> Destination language screenshot 0 ALT text:
> > 我们使用饼干
> > 点击 “全部接受”，即表示您同意在您的设备上存储Cookie，用于功能、分析和广告目的。
> Destination language screenshot 0 caption: We use cookies 🍪
> Post content:
> > In Chinese, the term “cookie” as in HTTP cookie is usually not translated (as seen in the body text of the pop-up), and rarely translated as “small text files.”

> Title: Ch… / Lis…
> Subtitle: It’s never a good idea to hardcode button size, especially smaller ones.
> Categories: Truncation
> Product: Microsoft / MSN
> Source language: English (United States)
> Destination language: Japanese, Russian, Thai, Vietnamese
> Source language screenshot 0 ALT text: Chart / List
> Source language screenshot 0 caption: Chart / List
> Destination language screenshot 0 ALT text: グ… / リ…
> Destination language screenshot 0 caption: グ… / リ…
> Destination language screenshot 1 ALT text: Ди… / Сп…
> Destination language screenshot 1 caption: Ди… / Сп…
> Destination language screenshot 2 ALT text: กร… / ราย…
> Destination language screenshot 2 caption: กร… / ราย…
> Destination language screenshot 3 ALT text: Biể… / Da…
> Destination language screenshot 3 caption: Biể… / Da…
> Post content:
> > MSN Weather. Designer hardcoded the size of the Chart/List toggle buttons based on English button width, causing strings in other languages to truncate.

> Title: Just Get Out!
> Subtitle: Don’t be so harsh, okay?
> Categories: Mistranslation
> Product: MVG
> Source language: German
> Destination language: English (United States), Japanese, Chinese (Simplified)
> Source language screenshot 0 ALT text:
> > Günstig mit dem Deutschlandticket unterwegs
> > Einfach mal raus!
> > Alle Infos
> Source language screenshot 0 caption: Simply head out!
> Destination language screenshot 0 ALT text:
> > Travel cheaply with the Deutschlandticket
> > Just get out!
> > All info
> Destination language screenshot 0 caption: Just get out!
> Destination language screenshot 1 ALT text:
> > Deutschlandticket 格安旅行
> > 出て行ってくれ！
> > すべての情報
> Destination language screenshot 1 caption: Get out of here!
> Destination language screenshot 2 ALT text:
> > 使用Deutschlandticket 廉价旅行
> > 快滚吧
> > 所有信息
> Destination language screenshot 2 caption: Get lost now!

> Title: 2025å¹´12æ17æ¥
> Subtitle: – “You’d better get a license by 2025å¹´12æ17æ¥…” – “Sorry, when was that?”
> Categories: Text encoding-Mojibake
> Product: Microsoft / Microsoft 365
> Source language: English (United States)
> Destination language: Chinese (Simplified)
> Source language screenshot 0 ALT text:
> > On [Saturday, November 9, 2024], most features of [Outlook] will be disabled. Ask your admin to reactivate your license. If you're no longer with this organization, select from the options below to continue using [Outlook]
> Destination language screenshot 0 ALT text:
> > 2025å¹´12æ17æ¥ 时，将禁用 [Word] 的大多数功能。请管理员重新激活你的许可证。如果你不再使用此组织，请从下面的选项中选择以继续使用 [Word]
> Destination language screenshot 0 caption:
> > At the time of 2025å¹´12æ17æ¥, most features of Word will be disabled. Ask your admin to reactivate your license. If you no longer use this organization, select from the options below to continue using Word
> Post content:
> > Date string “<span lang="zh-hans">2025年12月17日</span>” encoded as UTF-8 and incorrectly decoded as ISO-8859-1.
`,
                },
              },
            ],
          }
        },
      },
    ],
    tools: [
      {
        name: 'htmlToLexical',
        description: 'Convert HTML to Lexical Rich Text JSON serializer',
        parameters: z.object({
          html: z.string().min(1),
        }).shape,
        handler: async (args, req) => {
          const serialized = await convertHTMLToLexical(`${args.html}`, req.payload.config)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(serialized),
              },
            ],
          }
        },
      },
    ],
  },
})
