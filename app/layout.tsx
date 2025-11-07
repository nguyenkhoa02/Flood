import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ForecastProvider } from "@/contexts/ForecastContext"


const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hệ thống Dự báo Ngập lụt",
  description: "Ứng dụng dự báo và cảnh báo ngập lụt thông minh",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="mdl-js">
      <body className={`font-sans antialiased`}>
        <ForecastProvider>
          {children}
        </ForecastProvider>
        <Analytics />
      </body>
    </html>
  )
}
