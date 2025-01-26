import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })
  const result = await payload.auth({ headers: req.headers })

  if (!result.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json?.()

  if (!body) {
    return Response.json({ error: 'No request body' }, { status: 400 })
  }

  const { path, type } = body
  revalidatePath(path, type)

  return Response.json({ success: true })
}
