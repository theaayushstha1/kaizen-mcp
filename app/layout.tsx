import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kaizen — an AI analyst for the RevenueCat Charts API',
  description:
    'Ask an agent about a real indie app\u2019s unit economics. No install. Powered by the RevenueCat Charts API.',
  openGraph: {
    title: 'Kaizen',
    description: 'An AI analyst for the RevenueCat Charts API.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper font-sans antialiased">{children}</body>
    </html>
  );
}
