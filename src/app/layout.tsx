import type { Metadata } from 'next';
import './globals.css';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Vault - Spending Category Tracker',
  description: 'Personal desktop app for analyzing credit card spending patterns',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
