// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { Categories } from './collections/Categories/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { Products } from './collections/Products'
import { Languages } from './collections/Languages'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { siteTitle } from './utilities/constants'

let memoryDbUri: string | undefined
let memoryDb: MongoMemoryReplSet | undefined
if (!process.env.DATABASE_URI) {
  memoryDb = await MongoMemoryReplSet.create()
  memoryDbUri = memoryDb.getUri()
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: getServerSideURL(),
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
    autoLogin:
      process.env.NEXT_PUBLIC_ENABLE_AUTOLOGIN === 'true'
        ? {
            email: process.env.NEXT_PUBLIC_ENABLE_AUTOLOGIN_EMAIL || '',
            username: process.env.NEXT_PUBLIC_ENABLE_AUTOLOGIN_USERNAME || '',
            password: process.env.NEXT_PUBLIC_ENABLE_AUTOLOGIN_PASSWORD || '',
            prefillOnly: true,
          }
        : false,
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || memoryDbUri || '',
    mongoMemoryServer: process.env.DATABASE_URI ? undefined : memoryDb,
  }),
  // db: sqliteAdapter({
  //   client: {
  //     url: process.env.DATABASE_URI || '',
  //   },
  // }),
  debug: process.env.NODE_ENV === 'development',
  collections: [Pages, Posts, Media, Categories, Users, Products, Languages],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
  email: process.env.SMTP_FROM
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM,
        defaultFromName: siteTitle,
        // Nodemailer transportOptions
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
      })
    : undefined,
  onInit: async (payload) => {
    if (!payload.collections['payload-preferences'].config.hooks.beforeChange.length) {
      payload.collections['payload-preferences'].config.hooks.beforeChange.push((params) => {
        if (
          (params.operation === 'update' || params.operation === 'create') &&
          params.data?.value?.limit === 1
        ) {
          params.data.value.limit = 50
        }
        return params.data
      })
    }
  },
})
