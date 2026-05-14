"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PostCard } from "@/components/feed/PostCard";

const TYPES = ["all", "text", "poll", "data"] as const;
const SORTS = ["new", "top"] as const;

type Props = {
  posts: any[];
  userVotes: Record<string, number>;
  currentUserId: string | null;
  initialSort: string;
};

export function FeedClient({ posts, userVotes, currentUserId, initialSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeType, setActiveType] = useState<string>("all");
  const [activeSort, setActiveSort] = useState<string>(initialSort);

  // ✅ Client-side filter — instant, zero network calls
  const filtered = activeType === "all"
    ? posts
    : posts.filter((p) => p.post_type === activeType);

  // Sort is already applied server-side for initial load.
  // When user switches sort, we do a server navigation (intentional —
  // sort changes the DB query ORDER, can't be done purely client-side).
  function handleSortChange(sort: string) {
    setActiveSort(sort);
    router.push(`/feed?sort=${sort}`);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors capitalize ${
                activeType === t
                  ? "bg-brand-600 text-white"
                  : "bg-earth-800 text-earth-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {SORTS.map((s) => (
            <button
              key={s}
              onClick={() => handleSortChange(s)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors capitalize ${
                activeSort === s
                  ? "bg-earth-700 text-earth-100"
                  : "text-earth-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((post: any) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            userVote={userVotes[post.id] ?? null}
          />
        ))}
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-earth-500">
            No posts yet. Be the first!
          </div>
        )}
      </div>
    </>
  );
}