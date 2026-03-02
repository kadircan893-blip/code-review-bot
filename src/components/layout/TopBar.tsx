"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/repositories": "Repositories",
  "/reviews": "Reviews",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();

  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/repositories/") ? "Repository Detail" :
     pathname.startsWith("/reviews/") ? "Review Detail" :
     "Dashboard");

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-sm sticky top-0 z-30">
      <h1 className="text-white font-semibold">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors relative">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
