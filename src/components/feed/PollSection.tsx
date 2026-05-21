"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function PollSection({ postId, initialOptions, currentUserId }: any) {
  const [options, setOptions] = useState(initialOptions);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = options.reduce((s: number, o: any) => s + (o.votes || 0), 0);

  async function handleVote(optionId: number) {
    if (!currentUserId) {
      window.location.href = "/login";
      return;
    }
    if (voted || loading) return;
    setLoading(true);

    const updatedOptions = options.map((o: any) =>
      o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o,
    );

    setOptions(updatedOptions);
    setVoted(true);

    const { error } = await supabase
      .from("posts")
      .update({ poll_options: updatedOptions })
      .eq("id", postId);

    if (error) {
      setOptions(options);
      setVoted(false);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-2 mb-3">
      {options.map((opt: any) => {
        const pct =
          total > 0 ? Math.round(((opt.votes || 0) / total) * 100) : 0;
        return (
          <button
            key={opt.id}
            onClick={() => handleVote(opt.id)}
            disabled={voted || loading || !currentUserId}
            className="relative w-full bg-earth-700 rounded-lg overflow-hidden text-left"
          >
            <div
              className="absolute inset-y-0 left-0 bg-brand-600/30 transition-all"
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between px-3 py-2 text-sm">
              <span>{opt.text}</span>
              <span className="text-earth-400 text-xs">{pct}%</span>
            </div>
          </button>
        );
      })}
      <p className="text-xs text-earth-500">{total} votes</p>
    </div>
  );
}
