import { type NextRequest, NextResponse } from 'next/server'
import { registerVisitor, getStats } from '@/lib/visitors'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, page } = body as { sessionId?: unknown; page?: unknown }
    const normalizedSessionId = typeof sessionId === 'string' ? sessionId.trim() : ''

    if (
      normalizedSessionId.length === 0 ||
      normalizedSessionId.length > 128 ||
      !/^[a-zA-Z0-9_-]+$/.test(normalizedSessionId)
    ) {
      return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 })
    }

    const safePage =
      typeof page === 'string' && page.length <= 512 ? page : '/'

    registerVisitor(normalizedSessionId, safePage)
    return NextResponse.json(getStats())
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
