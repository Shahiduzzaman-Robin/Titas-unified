import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware({
    locales: ['en', 'bn'],
    defaultLocale: 'bn',
    localeDetection: false,
    localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;

    // Check if the path already has a locale prefix
    const pathnameHasLocale = /^\/(en|bn)(\/|$)/.test(pathname);

    // If cookie exists and path doesn't have the correct locale, redirect
    if (localeCookie && ['en', 'bn'].includes(localeCookie) && pathnameHasLocale) {
        const currentLocale = pathname.split('/')[1];

        // If current locale in URL doesn't match cookie, redirect to cookie locale
        if (currentLocale !== localeCookie) {
            const newPathname = pathname.replace(`/${currentLocale}`, `/${localeCookie}`);
            return NextResponse.redirect(new URL(`${newPathname}${request.nextUrl.search}`, request.url));
        }
    }

    // If no locale in path and we have a cookie, redirect to that locale
    if (localeCookie && ['en', 'bn'].includes(localeCookie) && !pathnameHasLocale) {
        return NextResponse.redirect(new URL(`/${localeCookie}${pathname}${request.nextUrl.search}`, request.url));
    }

    // --- INAUGURATION LOCKDOWN ---
    // Allowed routes: Auth, Admin, Students, API, Static
    // Only applies if the path has a locale (protecting localized public front-end)
    if (pathnameHasLocale) {
        const isAllowedRoute = /^\/(en|bn)\/(login|register|admin|student|students|coming-soon)(\/|$)/.test(pathname);
        if (!isAllowedRoute) {
            const locale = pathname.split('/')[1];
            const rewriteUrl = new URL(`/${locale}/coming-soon`, request.url);
            
            // Rewrite the request but manually attach the Next-Intl header so the page knows its locale
            const response = NextResponse.rewrite(rewriteUrl);
            response.headers.set('X-NEXT-INTL-LOCALE', locale);
            return response;
        }
    }
    // -----------------------------

    // Let next-intl handle the routing
    const response = handleI18nRouting(request);

    // Ensure cookie is set in response if it exists
    if (response && localeCookie) {
        response.cookies.set('NEXT_LOCALE', localeCookie, {
            path: '/',
            maxAge: 31536000, // 1 year
            sameSite: 'lax'
        });
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
