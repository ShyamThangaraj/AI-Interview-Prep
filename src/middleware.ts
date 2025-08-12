import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }
  return { url, key };
}

export async function middleware(req: NextRequest) {
  // Response we can write refreshed cookies to
  const res = NextResponse.next({ request: { headers: req.headers } });

  const { url, key } = getPublicEnv();

  // Bind a Supabase server client to this request/response
  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // Refresh/sync auth cookies onto `res` so SSR can see the session
  await supabase.auth.getSession();

  // Optional: keep logged-in users out of /login
  // const { data: { session } } = await supabase.auth.getSession();
  // if (req.nextUrl.pathname === '/login' && session) {
  //   return NextResponse.redirect(new URL('/post-login', req.url));
  // }

  return res;
}

// Run on everything except static assets and common files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};