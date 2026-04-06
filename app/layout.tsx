import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl gap-4 px-6 py-4 text-sm">
            <Link href="/">Dashboard</Link>
            <Link href="/wines">Vinos</Link>
            <Link href="/providers">Proveedores</Link>
            <Link href="/movements">Movimientos</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
