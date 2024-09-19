import { NextRequest, NextResponse } from 'next/server'

const publicPaths = ['/auth/signin', '/auth/register']

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = publicPaths.includes(pathname)

  const sessionToken = req.cookies.has('sessionid');

  if (isPublic && !sessionToken) {
    return NextResponse.next()
  }

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/auth/signin', req.nextUrl).toString())
  }

  if (isPublic && sessionToken) {
    return NextResponse.redirect(new URL('/', req.nextUrl).toString())
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
    '/',
  ]
}
