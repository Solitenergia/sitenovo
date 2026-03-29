import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes - redirect to /login if not authenticated
  const protectedPaths = ['/dashboard', '/clientes', '/usinas', '/unidades', '/portais', '/tickets', '/relatorios', '/faturas', '/configuracoes', '/oportunidades', '/mensagens']
  const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If accessing auth routes with session, redirect to /dashboard
  if ((pathname === '/login' || pathname === '/cadastro') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect root to /dashboard if authenticated, /login if not
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clientes/:path*',
    '/usinas/:path*',
    '/unidades/:path*',
    '/portais/:path*',
    '/tickets/:path*',
    '/relatorios/:path*',
    '/faturas/:path*',
    '/configuracoes/:path*',
    '/oportunidades/:path*',
    '/mensagens/:path*',
    '/login',
    '/cadastro',
    '/',
  ],
}
