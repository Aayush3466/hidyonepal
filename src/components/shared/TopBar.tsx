"use client";
import Link from "next/link";
import { Mountain, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function TopBar() {
  const pathname = usePathname();
  const isSearch = pathname === "/search";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-earth-200 h-14 flex items-center px-4 gap-3 shadow-sm">
      <Link href="/feed" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
          <Mountain className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm text-earth-900 tracking-wide">
          HidyoNepal
        </span>
      </Link>

      <div className="flex-1 flex justify-center">
        <Link
          href="/search"
          className={`flex items-center gap-2 w-52 px-3 py-2 rounded-xl border text-sm transition-all ${
            isSearch
              ? "bg-brand-50 border-brand-400 text-brand-600"
              : "bg-earth-50 border-earth-200 text-earth-400 hover:border-earth-300 hover:text-earth-600"
          }`}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Search</span>
        </Link>
      </div>
    </header>
  );
}
