import type {Metadata} from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cold Email Manager',
  description: 'A comprehensive cold email campaign manager with audience scheduling, A/B testing, template management, and analytics.',
  openGraph: {
    title: 'Cold Email Manager',
    description: 'A comprehensive cold email campaign manager with audience scheduling, A/B testing, template management, and analytics.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cold Email Manager',
    description: 'A comprehensive cold email campaign manager with audience scheduling, A/B testing, template management, and analytics.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${dmSans.variable} font-sans bg-[#FAFAFA] text-[#1A1A1A] antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
