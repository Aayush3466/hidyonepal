import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { BoardPostForm } from "@/components/trek-rooms";
import { timeAgo } from "@/lib/utils";
import { Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/user";

export default async function GroupBoardPage({ params }: any) {
  // ✅ await both in parallel
  const [supabase, user] = await Promise.all([
    createClient(),
    getCurrentUser(),
  ]);

  if (!user) redirect(`/login`);

  // ✅ membership check + group info + posts all in parallel
  // Previously: membership → then group → then posts (3 sequential round-trips)
  // Now: all 3 fire at once
  const [
    { data: membership, error: membershipError },
    { data: group },
    { data: posts },
  ] = await Promise.all([
    supabase
      .from("group_members")
      .select("role")
      .eq("group_id", params.id)
      .eq("user_id", user.id)
      .single(),
    supabase.from("groups").select("name").eq("id", params.id).single(),
    supabase
      .from("group_posts")
      .select("*, profiles(*)")
      .eq("group_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  if (membershipError && membershipError.code !== "PGRST116") {
    return (
      <div className="max-w-xl mx-auto px-3 py-4">
        <div className="card p-8 text-center">
          <p className="text-earth-400 mb-3">
            Something went wrong loading the board.
          </p>
          <a href={`/trek-rooms/${params.id}/board`} className="btn-primary">
            Try Again
          </a>
        </div>
      </div>
    );
  }

  if (!membership || membership.role === "pending") {
    return (
      <div className="max-w-xl mx-auto px-3 py-4">
        <div className="card p-8 text-center">
          <Lock className="w-8 h-8 text-earth-600 mx-auto mb-3" />
          <p className="text-earth-400">
            You need to be an accepted member to view the board.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-brand-400" />
        <h1 className="font-semibold">{group?.name} — Board</h1>
      </div>

      <BoardPostForm groupId={params.id} userId={user.id} />

      <div className="space-y-3 mt-4">
        {(posts || []).map((post: any) => (
          <div key={post.id} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                src={post.profiles?.avatar_url}
                name={post.profiles?.username || "U"}
                size="sm"
              />
              <span className="text-xs text-earth-400">
                <span className="text-earth-300 font-medium">
                  {post.profiles?.username}
                </span>
                {" · "}
                {timeAgo(post.created_at)}
              </span>
            </div>
            <p className="text-sm text-earth-200 leading-relaxed">
              {post.body}
            </p>
          </div>
        ))}
        {(!posts || posts.length === 0) && (
          <div className="card p-8 text-center text-earth-500 text-sm">
            No posts yet. Start the conversation!
          </div>
        )}
      </div>
    </div>
  );
}
