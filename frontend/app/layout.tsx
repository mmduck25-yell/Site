import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'
import Header from '@/components/Header'
import ScrollButtons from '@/components/ScrollButtons'


export const metadata: Metadata = {
  title: 'HONXXEE',
  description: '작품과 기록을 보관하는 포트폴리오 아카이브',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#e7dac0',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <AuthProvider>
          <DataProvider>
            <ScrollButtons />
            <div className="site-shell flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <footer className="border-t-2 border-primary/40 bg-card/80 py-8 text-center text-muted-foreground backdrop-blur-sm">
                <p className="font-display text-sm tracking-[0.08em] text-foreground/90">HONXXEE</p>
                <p className="mt-2 text-xs">&copy; {new Date().getFullYear()} HONXXEE. All rights reserved.</p>
              </footer>
            </div>
          </DataProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
