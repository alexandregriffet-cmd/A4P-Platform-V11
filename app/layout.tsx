import '@/styles/globals.css'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A4P Platform V11',
  description: 'Portail A4P double entrée, club, individuel, admin et résultats.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
