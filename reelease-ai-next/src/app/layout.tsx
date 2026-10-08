import type { Metadata, Viewport } from 'next'
import { fontConfig } from './fonts'
import './globals.css'
import Providers from './Providers'

export const metadata: Metadata = {
  title: {
    default: 'Smart AI Content Generation Suite',
    template: '%s | Smart AI Content Generation Suite',
  },
  description: 'AI-Powered Backend Management System',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart AI Content Generation Suite',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={
        {
          [fontConfig.variable]: fontConfig.family,
        } as React.CSSProperties
      }
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontConfig.url} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
