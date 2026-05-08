import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Request: ${request.nextUrl.pathname}`);
  
  try {
    const response = await updateSession(request)
    return response
  } catch (error) {
    console.error('[Middleware] Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
