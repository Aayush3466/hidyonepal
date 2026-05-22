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
    <div className="max-w-xl mx-auto px-4 py-4">
      <Link href={user ? "/feed/create" : "/login"} className="block mb-4">
        <div className="bg-white border border-earth-200 rounded-2xl p-4 hover:border-brand-400 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
              <PenLine className="w-4 h-4 text-brand-600" />
            </div>
            <span className="text-earth-400 text-sm flex-1">
              {user
                ? "Share a tip, ask a question…"
                : "Sign in to share your experience…"}
            </span>
            <span className="btn-primary pointer-events-none text-xs px-3 py-1.5">
              Post
            </span>
          </div>
        </div>
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
