'use client';

import { Header } from './Header';

interface TwoColumnLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function TwoColumnLayout({ children, sidebar }: TwoColumnLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 max-w-[1200px] mx-auto w-full">
        {/* Main Content */}
        <main className="flex-1 p-6 pb-32 md:pb-6">
          {children}
        </main>

        {/* Sidebar - Ideas/Archive */}
        <aside className="w-80 border-l border-border p-6 hidden md:block overflow-y-auto">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
