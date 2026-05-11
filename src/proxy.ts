import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Role } from '@/types/database';

// Route configuration
const PUBLIC_ROUTES = [
  '/',
  '/who-we-are',
  '/contact',
  '/pricing',
];

const PUBLIC_ROUTE_PREFIXES = [
  '/auth',
  '/api',
];

const ADMIN_ROUTE_PREFIX = '/admin';
const PROTECTED_ROUTE_PREFIX = '/dashboard';

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith(ADMIN_ROUTE_PREFIX);
}

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith(PROTECTED_ROUTE_PREFIX);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without auth checks
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Create a response that we can modify (for cookie refreshes)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with request/response cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Update cookies on the request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Create a new response with updated request headers
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // Set cookies on the response (sent back to browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          // Set cache-control headers to prevent CDN caching of auth responses
          if (headers) {
            Object.entries(headers).forEach(([key, val]) => {
              response.headers.set(key, val);
            });
          }
        },
      },
    }
  );

  // Validate session - this also refreshes the token if close to expiry
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No authenticated user - redirect to login
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // For admin routes, check the role
  if (isAdminRoute(pathname)) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role: Role | null = userData?.role ?? null;

    if (role !== 'superadmin') {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // For dashboard routes, any authenticated user can access
  // Role-based feature restrictions are enforced at the action level
  return response;
}

// Configure which routes the proxy runs on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
