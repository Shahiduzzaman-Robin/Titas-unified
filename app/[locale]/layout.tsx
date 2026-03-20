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
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-ExtraLight.ttf',
            weight: '200',
            style: 'normal',
        },
        {
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-ExtraLight-Italic.ttf',
            weight: '200',
            style: 'italic',
        },
        {
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-Light-Italic.ttf',
            weight: '300',
            style: 'italic',
        },
        {
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-Italic.ttf',
            weight: '400',
            style: 'italic',
        },
        {
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-SemiBold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-SemiBold-Italic.ttf',
            weight: '600',
            style: 'italic',
        },
        {
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../../public/fonts/li-ador-noirrit/Li-Ador-Noirrit-Bold-Italic.ttf',
            weight: '700',
            style: 'italic',
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
        <html lang={locale}>
            <body className={`${bnFont.variable} ${inter.variable} ${inter.className} ${locale === 'bn' ? 'bn-text' : ''}`}>
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
