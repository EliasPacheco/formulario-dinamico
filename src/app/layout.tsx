import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formulários Dinâmicos",
  description: "Sistema para criação e gerenciamento de formulários dinâmicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Formulários Dinâmicos
                </h1>
              </div>
              <nav className="flex space-x-8">
                <a
                  href="/"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Início
                </a>
                <a
                  href="/formularios"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Formulários
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
