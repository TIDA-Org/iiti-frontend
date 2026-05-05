import type { Metadata } from 'next'
import Script from 'next/script'
import { Syne, Plus_Jakarta_Sans, Barlow_Condensed, DM_Sans, Noto_Sans_Sinhala } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-barlow',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  variable: '--font-sinhala',
  weight: ['400', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IITI - Imasha International Training Institute',
  description: 'Sri Lanka\'s Premier Heavy Vehicle Training Institute. NVQ Level 3 certified training for Forklift, Excavator, and Backhoe Loader operators.',
  keywords: 'forklift training, excavator training, NVQ Level 3, TVEC, Sri Lanka vocational training',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-2328DVGCL7"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2328DVGCL7');
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${syne.variable} ${plusJakartaSans.variable} ${barlowCondensed.variable} ${dmSans.variable} ${notoSansSinhala.variable} font-sans antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
