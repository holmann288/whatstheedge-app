import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAILS = ['holmann288@gmail.com']
const PUBLIC_PATHS = ['/login', '/auth', '/api']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Allow public paths
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
    return supabaseResponse
  }

  // Not logged in → redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Admin bypass — skip subscriber check
  const email = user.email?.toLowerCase() || ''
  if (ADMIN_EMAILS.includes(email)) {
    return supabaseResponse
  }

  // Check subscriber status
  const { data: sub } = await supabase
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .limit(1)
    .single()

  if (sub?.status === 'active') {
    return supabaseResponse
  }

  // Not subscribed → redirect to subscribe page
  const url = request.nextUrl.clone()
  url.pathname = '/api/subscribe'
  url.searchParams.set('email', email)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
