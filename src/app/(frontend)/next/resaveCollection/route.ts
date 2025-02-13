import { createLocalReq, getPayload, User } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

export async function POST(
  req: Request & {
    cookies: {
      get: (name: string) => {
        value: string
      }
    }
  },
): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  const collection = (await req.json()).collection

  try {
    // Create a Payload request object to pass to the Local API for transactions
    // At this point you should pass in a user, locale, and any other context you need for the Local API
    const payloadReq = await createLocalReq({ user: user as User }, payload)

    const document = await payload.find({
      collection: collection,
      pagination: false,
    })

    await Promise.all(
      document.docs.map(async (document) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id } = document
        await payload.update({
          id: document.id,
          req: payloadReq,
          collection: collection,
          data: {},
        })
      }),
    )

    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding data' })
    return new Response('Error seeding data.', { status: 500 })
  }
}
