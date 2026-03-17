export const metadata = {
  title: 'A4P Platform',
  description: 'Plateforme de performance mentale A4P',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          backgroundColor: '#eef2f8',
        }}
      >
        {children}
      </body>
    </html>
  )
}
