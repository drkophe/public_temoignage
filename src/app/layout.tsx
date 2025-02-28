// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Témoignage public',
  description: 'Application de gestion d\'agenda pour association',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-[#4A6DA7] text-white p-4 shadow-md">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">Témoignage public</h1>
            </div>
          </header>
          <main className="container mx-auto py-6 px-4">
            {children}
          </main>
          <footer className="bg-gray-100 py-4">
            {/* <div className="container mx-auto text-center ">
              &copy; {new Date().getFullYear()} Témoignage public
            </div> */}
          </footer>
        </div>
      </body>
    </html>
  );
}