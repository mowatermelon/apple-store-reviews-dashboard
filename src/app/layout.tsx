import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin'] })

// SEO 优化的 Metadata
export const metadata: Metadata = {
  title: {
    default: 'App Store Reviews Dashboard | AI-Powered Review Analysis',
    template: '%s | App Store Reviews Dashboard'
  },
  description: 'Professional App Store review analysis platform with AI-powered insights. Analyze user feedback, track sentiment trends, and optimize your app strategy with comprehensive review analytics.',
  keywords: [
    'App Store reviews',
    'review analysis',
    'sentiment analysis',
    'app analytics',
    'user feedback',
    'mobile app insights',
    'iOS app reviews',
    'app store optimization',
    'ASO tools',
    'review dashboard',
    'app performance metrics',
    'user sentiment tracking'
  ],
  authors: [{ name: 'App Store Reviews Dashboard Team' }],
  creator: 'App Store Reviews Dashboard',
  publisher: 'App Store Reviews Dashboard',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://apple-store-reviews-nu.vercel.app',
    siteName: 'App Store Reviews Dashboard',
    title: 'App Store Reviews Dashboard | AI-Powered Review Analysis',
    description: 'Professional App Store review analysis platform with AI-powered insights. Analyze user feedback, track sentiment trends, and optimize your app strategy.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'App Store Reviews Dashboard - AI-Powered Review Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@appstore_reviews',
    title: 'App Store Reviews Dashboard | AI-Powered Review Analysis',
    description: 'Professional App Store review analysis platform with AI-powered insights.',
    images: ['/twitter-image.png'],
  },
  alternates: {
    canonical: 'https://apple-store-reviews-nu.vercel.app',
    languages: {
      'en-US': 'https://apple-store-reviews-nu.vercel.app',
      'zh-CN': 'https://apple-store-reviews-nu.vercel.app/zh',
      'ja-JP': 'https://apple-store-reviews-nu.vercel.app/ja',
    },
  },
  category: 'Technology',
  classification: 'Business Tools',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://apple-store-reviews-nu.vercel.app'),
  manifest: '/manifest.json',
  other: {
    'application-name': 'App Store Reviews Dashboard',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Reviews Dashboard',
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#2563eb',
  },
}

// 视口配置
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA 相关的 meta 标签 */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2563eb" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'App Store Reviews Dashboard',
              description: 'Professional App Store review analysis platform with AI-powered insights',
              url: 'https://apple-store-reviews-nu.vercel.app',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              creator: {
                '@type': 'Organization',
                name: 'App Store Reviews Dashboard Team',
              },
              featureList: [
                'App Store Review Analysis',
                'Multi-region Data Collection',
                'Sentiment Analysis',
                'Word Frequency Analysis',
                'Data Export',
                'Real-time Analytics'
              ]
            })
          }}
        />
        
        {/* Google Analytics 或其他统计代码可以在这里添加 */}
      </head>
      <body className={inter.className}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}