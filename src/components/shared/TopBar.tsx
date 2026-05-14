'use client'
import Link from 'next/link'
import { Mountain, Search } from 'lucide-react'

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-earth-900/95 backdrop-blur-sm border-b border-earth-800 h-14 flex items-center px-4 gap-3">
      <Link href="/feed" className="flex items-center gap-2 mr-auto">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
          <Mountain className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-wide">HidyoNepal</span>
      </Link>
      <Link href="/search" className="p-2 rounded-lg hover:bg-earth-800 transition-colors">
        <Search className="w-4 h-4 text-earth-400" />
      </Link>
    </header>
  )
}
