import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/user";
import { FeedClient } from "@/components/feed/FeedClient";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
export const revalidate = 30; // refresh every 30 seconds
export default async function FeedPage({ searchParams }: any) {
  // ✅ await createClient — it's async now
  const [supabase, user] = await Promise.all([
    createClient(),
    getCurrentUser(),
  ]);

  const sort = searchParams?.sort ?? "new";

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, title, body, post_type, vote_count, comment_count, location, tags, data_sections, poll_options, created_at, profiles(username, avatar_url)",
    )
    .order(sort === "top" ? "vote_count" : "created_at", { ascending: false })
    .limit(20);

  let userVotes: Record<string, number> = {};
  if (user && posts && posts.length > 0) {
    const { data: votes } = await supabase
      .from("votes")
      .select("post_id, value")
      .eq("user_id", user.id)
      .in(
        "post_id",
        posts.map((p: any) => p.id),
      );
    votes?.forEach((v: any) => {
      userVotes[v.post_id] = v.value;
    });
  }

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <Link
        href={user ? "/feed/create" : "/login"}
        className="card flex items-center gap-3 p-3 hover:border-earth-600 transition-colors mb-4 block"
      >
        <div className="w-8 h-8 rounded-full bg-earth-700 flex items-center justify-center flex-shrink-0">
          <PenLine className="w-4 h-4 text-earth-400" />
        </div>
        <span className="text-earth-500 text-sm flex-1">
          Share a tip, ask a question…
        </span>
        <span className="btn-primary pointer-events-none">Post</span>
      </Link>
      <ErrorBoundary>
        <FeedClient
          posts={posts || []}
          userVotes={userVotes}
          currentUserId={user?.id ?? null}
          initialSort={sort}
        />
      </ErrorBoundary>
    </div>
  );
}
