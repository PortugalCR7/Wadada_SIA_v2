import type { Metadata } from 'next'
import { Bodoni_Moda, Jost, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Soul Initiation',
  description: 'A six-month container for real transition. Soul Initiation guides individuals through the threshold of meaningful change.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${jost.variable} ${cormorant.variable}`}>
      <body className="font-jost bg-black text-white antialiased">{children}</body>
    </html>
  )
}
