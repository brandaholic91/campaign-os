import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Campaign OS',
  description: 'Communication and social media campaign planning tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu">
      <body className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                Campaign OS
              </Link>
              <div className="flex gap-2">
                <Link href="/campaigns">
                  <Button className="hover:bg-accent hover:text-accent-foreground">Kampányok</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
