"use client";
import Link from "next/link";
import { Mountain, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function TopBar() {
  const pathname = usePathname();
  const isSearch = pathname === "/search";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-earth-900/95 backdrop-blur-sm border-b border-earth-800 h-14 flex items-center px-4 gap-3">
      <Link href="/feed" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
          <Mountain className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-wide">HidyoNepal</span>
      </Link>

      <div className="flex-1 flex justify-center">
        <Link
          href="/search"
          className={`flex items-center gap-2 w-48 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
            isSearch
              ? "bg-earth-700 border-brand-500 text-brand-400"
              : "bg-earth-800 border-earth-700 text-earth-500 hover:border-earth-600"
          }`}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Search</span>
        </Link>
      </div>
    </header>
  );
}
