import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { Button } from '@/components/ui/button'
import { CopilotKitProvider } from '@/components/providers/CopilotKitProvider'
import { Toaster } from '@/components/ui/sonner'

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
      <body className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
        <CopilotKitProvider>
          <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20 text-white font-bold font-display">
                    C
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-gray-900 leading-none tracking-tight">Campaign OS</span>
                  </div>
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100/50 rounded-full border border-gray-200/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-600">Rendszer aktív</span>
                </div>
                <Link href="/campaigns">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-gray-900/10 flex items-center gap-2">
                    <span>Kampányok</span>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </CopilotKitProvider>
        <Toaster />
      </body>
    </html>
  )
}
