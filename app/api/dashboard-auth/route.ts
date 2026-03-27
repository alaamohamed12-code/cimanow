import { createHash, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'

const AUTH_COOKIE = 'dashboard_auth'
const AUTH_USERNAME = process.env.DASHBOARD_USERNAME
const AUTH_PASSWORD = process.env.DASHBOARD_PASSWORD
const AUTH_SECRET = process.env.DASHBOARD_AUTH_SECRET

const isConfigured = (): boolean =>
  Boolean(AUTH_USERNAME && AUTH_PASSWORD && AUTH_SECRET)

const toToken = (username: string, password: string) =>
  createHash('sha256').update(`${username}:${password}:${AUTH_SECRET}`).digest('hex')

const safeEqual = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) {
    return false
  }
  return timingSafeEqual(aBuf, bBuf)
}

const hasValidAuthCookie = (cookieValue: string | undefined): boolean => {
  if (!cookieValue || !isConfigured()) {
    return false
  }

  const expected = toToken(AUTH_USERNAME!, AUTH_PASSWORD!)
  return safeEqual(cookieValue, expected)
}

export async function GET(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ authenticated: false, configured: false }, { status: 503 })
  }

  const cookieHeader = request.headers.get('cookie') ?? ''
  const cookieValue = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE}=`))
    ?.slice(`${AUTH_COOKIE}=`.length)

  return NextResponse.json({ authenticated: hasValidAuthCookie(cookieValue), configured: true })
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ message: 'لم يتم إعداد بيانات دخول لوحة التحكم بعد.' }, { status: 503 })
  }

  let body: { username?: string; password?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'بيانات الدخول غير صالحة.' }, { status: 400 })
  }

  const username = (body.username ?? '').trim()
  const password = body.password ?? ''

  if (!safeEqual(username, AUTH_USERNAME!) || !safeEqual(password, AUTH_PASSWORD!)) {
    return NextResponse.json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, configured: true })
  response.cookies.set({
    name: AUTH_COOKIE,
    value: toToken(AUTH_USERNAME!, AUTH_PASSWORD!),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: AUTH_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  })
  return response
}
