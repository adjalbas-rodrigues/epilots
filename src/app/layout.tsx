import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/hooks/useToast'
import { AuthProvider } from '@/contexts/AuthContext'
import ClientAuthProvider from '@/components/ClientAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Elite Pilots - Sistema de Questões para Práticos',
  description: 'Sistema de questões e simulados para práticos de navio',
  keywords: 'práticos, navio, questões, simulados, marinha, navegação',
  authors: [{ name: 'Elite Pilots' }],
  creator: 'Elite Pilots',
  publisher: 'Elite Pilots',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  themeColor: '#2C5F8D',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <ClientAuthProvider>
              {children}
            </ClientAuthProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}