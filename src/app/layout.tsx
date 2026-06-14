import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Fudeeko',
  description: 'Discover the best place to eat based on your mood, time, and location.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#FFFDF8', color: '#1F2937' }}>
        {children}
      </body>
    </html>
  );
}
