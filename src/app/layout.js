import './globals.css'

export const metadata = {
  title: 'Interior Design Studio - Create Beautiful Spaces',
  description: 'Professional interior design tool for creating stunning room layouts with furniture placement and visualization.',
  keywords: 'interior design, furniture placement, room design, design tool',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {children}
      </body>
    </html>
  )
}
