import "./globals.css";
import { cookies } from 'next/headers';
import { Preferences } from '@/components/preferences';
import { locales } from '@/lib/translations';
import { CustomCursor } from '@/components/cursor';
import { KRMPhysics } from '@/components/krm-physics';
import { Outfit } from 'next/font/google';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

const pantones = [
    { code: '19-4052', name: 'Classic Blue', hex: '#0F4C81' },
    { code: '16-1546', name: 'Living Coral', hex: '#FF6F61' },
    { code: '18-3838', name: 'Ultra Violet', hex: '#5F4B8B' },
    { code: '15-0343', name: 'Greenery', hex: '#88B04B' },
    { code: '13-1520', name: 'Rose Quartz', hex: '#F7CAC9' },
    { code: '15-3919', name: 'Serenity', hex: '#91A8D0' },
    { code: '17-5104', name: 'Ultimate Gray', hex: '#939597' },
    { code: '13-0647', name: 'Illuminating', hex: '#F5DF4D' },
    { code: '17-3938', name: 'Very Peri', hex: '#6667AB' },
    { code: '18-1750', name: 'Viva Magenta', hex: '#BE3455' },
    { code: '13-1023', name: 'Peach Fuzz', hex: '#FFBE98' },
];

function getPantoneStyles() {
    const now = new Date();
    const tzDate = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const startOfYear = new Date(Date.UTC(tzDate.getUTCFullYear(), 0, 0));
    const diff = tzDate.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const todayPantone = pantones[dayOfYear % pantones.length];

    const r = parseInt(todayPantone.hex.slice(1, 3), 16);
    const g = parseInt(todayPantone.hex.slice(3, 5), 16);
    const b = parseInt(todayPantone.hex.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    const ink = (yiq >= 128) ? '#101010' : '#f2f0ea';
    const line = ink === '#101010' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
    return {
        '--paper': todayPantone.hex,
        '--ink': ink,
        '--line': line,
        '--acid': ink,
        '--acid-contrast': ink === '#101010' ? '#f2f0ea' : '#101010'
    };
}

export const metadata = {
    metadataBase: new URL('https://krmdesign.co'),
    title: "KRM Design — Football, Reframed",
    description: "Independent football kit design and visual direction by Kerem Can Kuru.",
    openGraph: {
        title: "KRM Design — Football, Reframed",
        description: "Independent football kit design and visual direction by Kerem Can Kuru.",
        url: 'https://krmdesign.co',
        siteName: 'KRM Design',
        images: [
            {
                url: '/krmIconDarkMode.png',
                width: 800,
                height: 800,
            }
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'KRM Design',
        description: 'Football, Reframed.',
    },
    icons: [
        { media: '(prefers-color-scheme: light)', url: '/krmIconLightMode.png', href: '/krmIconLightMode.png' },
        { media: '(prefers-color-scheme: dark)', url: '/krmIconDarkMode.png', href: '/krmIconDarkMode.png' }
    ],
};

export default async function RootLayout({ children }) {
    const jar = await cookies();
    const locale = (locales.some(([code]) => code === jar.get('krm-language')?.value) ? jar.get('krm-language').value : 'en');
    const cookieTheme = jar.get('krm-theme')?.value;
    const theme = cookieTheme === 'pantone' ? 'pantone' : (cookieTheme === 'dark' ? 'dark' : 'light');

    return (<html lang={locale} data-theme={theme} style={theme === 'pantone' ? getPantoneStyles() : undefined}>
        <body className={`antialiased ${outfit.variable}`}>
            <Preferences initialLocale={locale} initialTheme={theme}>
                <CustomCursor />
                <KRMPhysics />
                {children}
            </Preferences>
        </body>
    </html>);
}
