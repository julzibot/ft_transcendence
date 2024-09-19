import { NextRequest, NextResponse } from 'next/server'
// import { cookies } from 'next/headers'
// import { SERVER_URL, API_URL } from './config'


const protectedRoutes = [
  '/',
  '/account',
  '/test',
]

const publicRoutes = [
  '/auth/signin',
  '/auth/register',
]

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedRoutes.includes(path);
  const isPublic = publicRoutes.includes(path);

  const sessionToken = req.cookies.get('sessionid')?.value;


  if (isProtected && !sessionToken) {
    return NextResponse.redirect(new URL('/auth/signin', req.nextUrl).toString())
  }

  if (isPublic && sessionToken && !req.nextUrl.pathname.startsWith('/')) {
    return NextResponse.redirect(new URL('/', req.nextUrl).toString())
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}
