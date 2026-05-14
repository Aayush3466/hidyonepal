'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, ShoppingBag, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/trek-rooms', icon: Users, label: 'Rooms' },
  { href: '/marketplace', icon: ShoppingBag, label: 'Gear' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-earth-900/95 backdrop-blur-sm border-t border-earth-800 h-16 flex items-center justify-around px-2">
      {nav.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}
          className={cn('flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors',
            pathname.startsWith(href) ? 'text-brand-400' : 'text-earth-500 hover:text-earth-300'
          )}>
          <Icon className="w-5 h-5" />
          <span className="text-xs">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
