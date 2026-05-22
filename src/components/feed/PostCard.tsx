"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, MessageSquare, MapPin } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { cn, timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ✅ Fix: client created once at module level, not inside component body
const supabase = createClient();

export const PostCard = React.memo(function PostCard({
  post,
  currentUserId,
  userVote: initialVote,
}: any) {
  const [votes, setVotes] = useState(post.vote_count || 0);
  const [userVote, setUserVote] = useState<number | null>(initialVote ?? null);

  // ✅ Prevent double-clicks from firing multiple DB writes
  const isPending = useRef(false);

  async function handleVote(value: number) {
    if (!currentUserId) {
      window.location.href = "/login";
      return;
    }
    if (isPending.current) return;
    isPending.current = true;

    const prevVotes = votes;
    const prevVote = userVote;

    const newVote = userVote === value ? null : value;
    const delta = (newVote ?? 0) - (userVote ?? 0);

    // Optimistic update — UI responds instantly
    setVotes((v: number) => v + delta);
    setUserVote(newVote);

    try {
      if (newVote === null) {
        await supabase
          .from("votes")
          .delete()
          .match({ user_id: currentUserId, post_id: post.id });
      } else if (userVote !== null) {
        await supabase
          .from("votes")
          .update({ value: newVote })
          .match({ user_id: currentUserId, post_id: post.id });
      } else {
        await supabase
          .from("votes")
          .insert({ user_id: currentUserId, post_id: post.id, value: newVote });
      }
    } catch {
      // Rollback using captured values — not stale closure
      setVotes(prevVotes);
      setUserVote(prevVote);
    } finally {
      isPending.current = false;
    }
  }

  const dataSections = Array.isArray(post.data_sections)
    ? post.data_sections
    : [];

  return (
    <article className="card p-4 border-2 border-green-100 hover:border-green-300 transition-all">
      {" "}
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
          <button
            onClick={() => handleVote(1)}
            aria-label="Upvote"
            className={cn(
              "p-1 rounded transition-colors",
              userVote === 1
                ? "text-green-600"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span
            className={cn(
              "text-sm font-medium",
              votes > 0
                ? "text-green-600"
                : votes < 0
                  ? "text-blue-500"
                  : "text-gray-400",
            )}
          >
            {votes}
          </span>
          <button
            onClick={() => handleVote(-1)}
            aria-label="Downvote"
            className={cn(
              "p-1 rounded transition-colors",
              userVote === -1
                ? "text-blue-500"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Avatar
              src={post.profiles?.avatar_url}
              name={post.profiles?.username || "U"}
              size="sm"
            />
            <span className="text-xs text-gray-400">
              <span className="text-gray-700 font-medium">
                {post.profiles?.username}
              </span>
              {" · "}
              {timeAgo(post.created_at)}
            </span>
            {post.post_type !== "text" && (
              <span className="ml-auto tag capitalize">{post.post_type}</span>
            )}
          </div>

          <Link href={`/feed/${post.id}`}>
            <h2 className="font-semibold text-gray-800 leading-snug mb-1 hover:text-green-700 transition-colors">
              {" "}
              {post.title}
            </h2>
          </Link>

          {post.body && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
              {post.body}
            </p>
          )}

          {dataSections.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {dataSections.map((ds: any, i: number) => (
                <div
                  key={i}
                  className="bg-earth-700/60 rounded-lg px-2 py-1 text-xs"
                >
                  <span className="text-earth-500">{ds.label}: </span>
                  <span className="text-earth-200 font-medium">{ds.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
            {" "}
            {post.location && (
              <span className="flex items-center gap-1 text-green-700 font-medium">
                <MapPin className="w-3 h-3" />
                {post.location}
              </span>
            )}
            <Link
              href={`/feed/${post.id}`}
              className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors text-green-700"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{post.comment_count || 0} comments</span>
            </Link>
            {(post.tags || []).slice(0, 2).map((tag: string) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
});
