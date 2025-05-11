import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import CacheManager from '@/components/CacheManager';
import { NutritionDataProvider } from '@/lib/NutritionDataContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FitMaxxer 9000',
  description: 'All-in-one fitness tracking application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CacheManager />
          <NutritionDataProvider>
            {children}
          </NutritionDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 