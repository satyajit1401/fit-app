'use client';

import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  backUrl?: string;
  rightElement?: React.ReactNode;
  bottomElement?: React.ReactNode;
}

export default function Layout({ children, title, backUrl, rightElement, bottomElement }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-16">
      <Header title={title} backUrl={backUrl} rightElement={rightElement} />
      <main className="flex-1 p-4 mt-14">
        {children}
      </main>
      {bottomElement}
      <Sidebar />
    </div>
  );
} 