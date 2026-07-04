import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si on n'est pas sur la page de connexion, qu'on n'est pas sur la racine (landing page), et pas d'utilisateur -> on redirige vers /connexion
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/connexion') &&
    !request.nextUrl.pathname.startsWith('/inscription') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/mot-de-passe-oublie') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    return NextResponse.redirect(url)
  }

  // Si on est sur la page de connexion et qu'on est déjà connecté -> on redirige vers le dashboard
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/connexion') || request.nextUrl.pathname.startsWith('/inscription'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Routes réservées aux administrateurs : vérifiées ici en plus du RLS et du
  // masquage de menu côté client, pour ne pas dépendre uniquement de ceux-ci.
  const ADMIN_ONLY_PATHS = ['/parametres', '/campagnes', '/rapports', '/intrants', '/dashboard']
  const isAdminOnlyPath = ADMIN_ONLY_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))

  if (user && isAdminOnlyPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/producteurs'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
