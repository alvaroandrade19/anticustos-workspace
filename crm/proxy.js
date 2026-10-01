import { NextResponse } from 'next/server';

const PUBLIC = new Set(['/login', '/favicon.ico']);

export function proxy(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/webhook') || PUBLIC.has(pathname)) {
    return NextResponse.next();
  }
  const secret = process.env.AUTH_SECRET;
  const ok = secret && req.cookies.get('crm_auth')?.value === secret; // guard: secret vazio não passa
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] };
