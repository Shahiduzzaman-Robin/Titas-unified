import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";
import type { Metadata } from 'next';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';

import localFont from 'next/font/local';

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
});

const bnFont = localFont({
    src: [
        {
            path: '../../public/fonts/Lal_Sabuj_Normal_31-08-2012.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../../public/fonts/LalSabuj Normal_Bold-04-09-2012.ttf',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-bangla',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Titas - Student Management",
    description: "Student Registration and Management System",
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: {
        title: "Titas - Community Hub",
        description: "ঢাকা বিশ্ববিদ্যালয়স্থ ব্রাহ্মণবাড়িয়া জেলার শিক্ষার্থীদের মেধা, মনন ও ঐক্যের প্রতীক।",
        url: "https://titaas.vercel.app",
        siteName: "Titas (তিতাস)",
        images: [
            {
                url: "https://res.cloudinary.com/dwybib7hh/image/upload/v1774170410/titas/hero/Fruit_Fest.jpg",
                width: 1200,
                height: 630,
                alt: "Titas Community",
            }
        ],
        locale: "bn_BD",
        type: "website",
    }
};

export default async function LocaleLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();

    return (
        <html lang={locale} className="notranslate" translate="no" suppressHydrationWarning>
            <head>
                {/* Manual font preloads disabled to avoid Next.js caching conflicts and console warnings */}
            </head>
            <body className={`${bnFont.variable} ${inter.variable} ${inter.className} ${locale === 'bn' ? 'bn-text' : ''}`} suppressHydrationWarning>
                <NextIntlClientProvider messages={messages}>
                    <SessionProviderWrapper>
                        {children}
                    </SessionProviderWrapper>
                    <Toaster position="top-center" richColors />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
// redeploy
