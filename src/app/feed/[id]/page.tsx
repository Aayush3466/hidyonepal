import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { CommentSection } from "@/components/feed/CommentSection";
import { timeAgo } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { getCurrentUser } from "@/lib/user";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

import { PollSection } from "@/components/feed/PollSection";

export default async function PostPage({ params }: any) {
  // ✅ await both in parallel
  const [supabase, user] = await Promise.all([
    createClient(),
    getCurrentUser(),
  ]);

  // ✅ post + comments in parallel — was sequential before
  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "id, title, body, post_type, vote_count, comment_count, location, tags, data_sections, poll_options, created_at, profiles(username, avatar_url)",
      )
      .eq("id", params.id)
      .single(),
    supabase
      .from("comments")
      .select("*, profiles(*)")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true }),
  ]);

  if (!post) notFound();

  const dataSections = Array.isArray(post.data_sections)
    ? post.data_sections
    : [];
  const pollOptions = Array.isArray(post.poll_options) ? post.poll_options : [];

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <Link
        href="/feed"
        className="flex items-center gap-2 text-earth-400 hover:text-earth-200 text-sm mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </Link>
      <article className="card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar
            src={(post.profiles as any)?.avatar_url}
            name={(post.profiles as any)?.username || "U"}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-earth-200">
              {(post.profiles as any)?.username}
            </p>
            <p className="text-xs text-earth-500">{timeAgo(post.created_at)}</p>
          </div>
          {post.location && (
            <span className="ml-auto flex items-center gap-1 text-xs text-earth-500">
              <MapPin className="w-3 h-3" />
              {post.location}
            </span>
          )}
        </div>

        <h1 className="text-lg font-semibold mb-2">{post.title}</h1>
        {post.body && (
          <p className="text-sm text-earth-300 leading-relaxed mb-3">
            {post.body}
          </p>
        )}

        {dataSections.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {dataSections.map((ds: any, i: number) => (
              <div key={i} className="bg-earth-700/50 rounded-lg p-2">
                <p className="text-xs text-earth-500">{ds.label}</p>
                <p className="text-sm font-medium text-earth-100">{ds.value}</p>
              </div>
            ))}
          </div>
        )}

        {pollOptions.length > 0 && (
          <PollSection
            postId={post.id}
            initialOptions={pollOptions}
            currentUserId={user?.id ?? null}
          />
        )}

        {(post.tags || []).length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {post.tags.map((t: string) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>
      <ErrorBoundary
        fallback={
          <div className="card p-6 text-center text-earth-500 text-sm">
            Comments couldn&apos;t load.
          </div>
        }
      >
        <CommentSection
          postId={post.id}
          comments={comments || []}
          currentUserId={user?.id}
          currentUsername={user?.email?.split("@")[0] ?? "You"}
        />
      </ErrorBoundary>
    </div>
  );
}
