import { betterFetch } from '@better-fetch/fetch';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE_NAME,
  routing,
} from './i18n/routing';
import type { Session } from './lib/auth-types';
import { getBaseUrl } from './lib/urls/urls';
import {
  DEFAULT_LOGIN_REDIRECT,
  protectedRoutes,
  routesNotAllowedByLoggedInUsers,
  Routes,
} from './routes';

const intlMiddleware = createMiddleware(routing);

/**
 * 1. Next.js middleware
 * https://nextjs.org/docs/app/building-your-application/routing/middleware
 *
 * 2. Better Auth middleware
 * https://www.better-auth.com/docs/integrations/next#middleware
 *
 * In Next.js middleware, it's recommended to only check for the existence of a session cookie
 * to handle redirection. To avoid blocking requests by making API or database calls.
 */
export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  console.log('>> middleware start, pathname', nextUrl.pathname);

  // Handle internal docs link redirection for internationalization
  // Check if this is a docs page without locale prefix
  if (nextUrl.pathname.startsWith('/docs/') || nextUrl.pathname === '/docs') {
    // Get the user's preferred locale from cookie
    const localeCookie = req.cookies.get(LOCALE_COOKIE_NAME);
    const preferredLocale = localeCookie?.value;

    // If user has a non-default locale preference, redirect to localized version
    if (
      preferredLocale &&
      preferredLocale !== DEFAULT_LOCALE &&
      LOCALES.includes(preferredLocale)
    ) {
      const localizedPath = `/${preferredLocale}${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      console.log(
        '<< middleware end, redirecting docs link to preferred locale:',
        localizedPath
      );
      return NextResponse.redirect(new URL(localizedPath, nextUrl));
    }
  }

  // do not use getSession() here, it will cause error related to edge runtime
  // const session = await getSession();
  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: getBaseUrl(),
      headers: {
        cookie: req.headers.get('cookie') || '', // Forward the cookies from the request
      },
    }
  );
  const isLoggedIn = !!session;
  // console.log('middleware, isLoggedIn', isLoggedIn);

  // Get the pathname of the request (e.g. /zh/dashboard to /dashboard)
  const pathnameWithoutLocale = getPathnameWithoutLocale(
    nextUrl.pathname,
    LOCALES
  );

  // If the route can not be accessed by logged in users, redirect if the user is logged in
  if (isLoggedIn) {
    const isNotAllowedRoute = routesNotAllowedByLoggedInUsers.some((route) =>
      new RegExp(`^${route}$`).test(pathnameWithoutLocale)
    );
    if (isNotAllowedRoute) {
      console.log(
        '<< middleware end, not allowed route, already logged in, redirecting to dashboard'
      );
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    new RegExp(`^${route}$`).test(pathnameWithoutLocale)
  );
  // console.log('middleware, isProtectedRoute', isProtectedRoute);

  // If the route is a protected route, redirect to login if user is not logged in
  if (!isLoggedIn && isProtectedRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    console.log(
      '<< middleware end, not logged in, redirecting to login, callbackUrl',
      callbackUrl
    );
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // If user is logged in but trying to access dashboard without payment, redirect to landing
  if (isLoggedIn && pathnameWithoutLocale === Routes.Dashboard) {
    // First check if there's a payment verification cookie
    const paymentVerifiedCookie = req.cookies.get('payment_verified');
    if (paymentVerifiedCookie?.value === 'true') {
      // If cookie exists and is valid, allow access to dashboard
      console.log('<< middleware end, payment verified via cookie, allowing access to dashboard');
    } else {
      // If no cookie or invalid cookie, check database
      try {
        // Import auth and get user session directly
        const { auth } = await import('@/lib/auth');
        const session = await auth.api.getSession({
          headers: {
            cookie: req.headers.get('cookie') || '',
          },
        });
        
        if (session?.user?.id) {
          // Import the payment check action
          const { checkUserPaymentStatusAction } = await import('@/actions/check-user-payment-status');
          const result = await checkUserPaymentStatusAction({ userId: session.user.id });
          
          if (!result.success || !result.hasPaid) {
            console.log('<< middleware end, user has not paid, redirecting to landing page');
            return NextResponse.redirect(new URL(Routes.Landing, nextUrl));
          }
        } else {
          // If we can't verify the user, be safe and redirect to landing
          console.log('<< middleware end, could not verify user, redirecting to landing page');
          return NextResponse.redirect(new URL(Routes.Landing, nextUrl));
        }
      } catch (error) {
        // If there's an error checking payment status, be safe and redirect to landing
        console.log('<< middleware end, error checking payment status, redirecting to landing page');
        return NextResponse.redirect(new URL(Routes.Landing, nextUrl));
      }
    }
  }

  // Apply intlMiddleware for all routes
  console.log('<< middleware end, applying intlMiddleware');
  return intlMiddleware(req);
}

/**
 * Get the pathname of the request (e.g. /zh/dashboard to /dashboard)
 */
function getPathnameWithoutLocale(pathname: string, locales: string[]): string {
  const localePattern = new RegExp(`^/(${locales.join('|')})/`);
  return pathname.replace(localePattern, '/');
}

/**
 * Next.js internationalized routing
 * specify the routes the middleware applies to
 *
 * https://next-intl.dev/docs/routing#base-path
 */
export const config = {
  // The `matcher` is relative to the `basePath`
  matcher: [
    // Match all pathnames except for
    // - if they start with `/api`, `/_next` or `/_vercel`
    // - if they contain a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
