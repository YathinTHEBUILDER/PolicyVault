import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SITE_URL } from '../constants'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isPortalAuthPage = request.nextUrl.pathname.startsWith('/portal/login') || request.nextUrl.pathname.startsWith('/portal/verify')
  const isPublicApi = request.nextUrl.pathname.startsWith('/api/public')

  const baseUrl = SITE_URL || request.nextUrl.origin

  if (!user && !isAuthPage && !isPortalAuthPage && !isPublicApi) {
    const loginUrl = new URL('/login', baseUrl)
    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthPage) {
    const homeUrl = new URL('/', baseUrl)
    return NextResponse.redirect(homeUrl)
  }

  return supabaseResponse
}
