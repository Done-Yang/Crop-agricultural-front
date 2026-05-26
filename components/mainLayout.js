"use client";

import MobileNav from "@/components/mobile-nav";

export default function MainLayout({
  title,
  subtitle,
  headerActions,
  headerExtra,
  children,
}) {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {headerActions}
          </div>
        </div>
        {headerExtra}
      </header>

      {children}

      <MobileNav />
    </div>
  );
}
