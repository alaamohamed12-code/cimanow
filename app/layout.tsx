import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VisitorTracker from '@/components/VisitorTracker'

export const metadata: Metadata = {
  title: 'CimaView - أفلام ومسلسلات عربية وأجنبية',
  description: 'شاهد وتصفح أحدث الأفلام والمسلسلات العربية والأجنبية بجودة عالية وتجربة استخدام احترافية.',
  keywords: 'أفلام، مسلسلات، منوعات، بث، streaming',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-screen flex flex-col text-white">
        <VisitorTracker />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
