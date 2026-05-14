"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Users } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce"; // npm i use-debounce

type Props = {
  q: string;
  posts: any[];
  groups: any[];
  equipment: any[];
};

export function SearchClient({ q, posts, groups, equipment }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posts");

  // ✅ Debounced search — waits 350ms after user stops typing before
  // navigating. Prevents a Supabase query on every single keystroke.
  const handleSearch = useDebouncedCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}&tab=posts`);
    }
  }, 350);

  const tabs = [
    { key: "posts", label: "Posts", count: posts.length },
    { key: "groups", label: "Rooms", count: groups.length },
    { key: "gear", label: "Gear", count: equipment.length },
  ];

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-500" />
        <input
          className="input pl-9"
          placeholder="Search posts, rooms, gear…"
          defaultValue={q}
          autoFocus
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {q && (
        <>
          {/* ✅ Tab switching is now instant — no navigation, no refetch */}
          <div className="flex gap-2 mb-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                  activeTab === t.key
                    ? "bg-earth-700 text-earth-100"
                    : "text-earth-500 hover:text-earth-300"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className="text-xs opacity-60 ml-0.5">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "posts" && (
            <div className="space-y-2">
              {posts.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/feed/${p.id}`}
                  className="card p-3 block hover:border-earth-600 transition-colors"
                >
                  <p className="font-medium text-sm mb-1">{p.title}</p>
                  <p className="text-xs text-earth-500">
                    {(p.profiles as any)?.username} · {timeAgo(p.created_at)}
                  </p>
                </Link>
              ))}
              {/* ✅ Fix: was `"{q}"` — literal string, not interpolated */}
              {!posts.length && (
                <div className="card p-6 text-center text-earth-500 text-sm">
                  No posts found for &ldquo;{q}&rdquo;
                </div>
              )}
            </div>
          )}

          {activeTab === "groups" && (
            <div className="space-y-2">
              {groups.map((g: any) => (
                <Link
                  key={g.id}
                  href={`/trek-rooms/${g.id}`}
                  className="card p-3 block hover:border-earth-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-earth-500" />
                    <p className="font-medium text-sm">{g.name}</p>
                  </div>
                  {g.location && (
                    <p className="text-xs text-earth-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{g.location}
                    </p>
                  )}
                </Link>
              ))}
              {!groups.length && (
                <div className="card p-6 text-center text-earth-500 text-sm">
                  No rooms found for &ldquo;{q}&rdquo;
                </div>
              )}
            </div>
          )}

          {activeTab === "gear" && (
            <div className="space-y-2">
              {equipment.map((e: any) => (
                <Link
                  key={e.id}
                  href={`/marketplace/${e.id}`}
                  className="card p-3 block hover:border-earth-600 transition-colors"
                >
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-earth-500 mt-1 capitalize">
                    {e.category?.replace("_", " ")} · {e.condition}
                  </p>
                </Link>
              ))}
              {!equipment.length && (
                <div className="card p-6 text-center text-earth-500 text-sm">
                  No gear found for &ldquo;{q}&rdquo;
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!q && (
        <div className="card p-10 text-center text-earth-500 mt-4">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">Search posts, trek rooms, and gear</p>
        </div>
      )}
    </div>
  );
}