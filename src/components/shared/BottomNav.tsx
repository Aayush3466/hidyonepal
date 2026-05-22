"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ShoppingBag, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/trek-rooms", icon: Users, label: "Rooms" },
  { href: "/routes", icon: Map, label: "Routes" },
  { href: "/marketplace", icon: ShoppingBag, label: "Gear" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-earth-200 h-16 flex items-center justify-around px-2 shadow-sm">
      {nav.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all",
              active ? "text-brand-600" : "text-earth-400 hover:text-earth-600",
            )}
          >
            <Icon className={cn("w-5 h-5", active && "stroke-[2.5px]")} />
            <span className={cn("text-xs", active ? "font-medium" : "")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
