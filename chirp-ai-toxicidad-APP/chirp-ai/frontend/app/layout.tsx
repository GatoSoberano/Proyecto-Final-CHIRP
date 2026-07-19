import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'Chirp AI', description: 'Red social con IA de moderación' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <nav className="nav">
          <span className="brand">🐦 Chirp AI</span>
          <Link href="/">Inicio</Link>
          <Link href="/heatmap">Analizar</Link>
          <Link href="/login">Login</Link>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
