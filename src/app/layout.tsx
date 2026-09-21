import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';

export const metadata: Metadata = {
  title: 'Local Legend — AI-Powered Neighborhood Memory Map',
  description:
    'Discover cities through meaningful human experiences. Attach personal stories, vintage photos, and voice notes to real coordinates on an interactive community map.',
  keywords: ['neighborhood map', 'oral history', 'local memories', 'travel journal', 'AI memory map'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment-pattern text-charcoal antialiased flex flex-col selection:bg-terracotta/20 selection:text-terracotta-800">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
