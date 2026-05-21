"use client";

import { useState } from "react";
import { Avatar } from "@/components/shared/Avatar";
import { timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ✅ Client created once at module level
const supabase = createClient();

export function CommentSection({
  postId,
  comments: initialComments,
  currentUserId,
  currentUsername,
}: any) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  // ✅ Local state for comments — optimistic append, no router.refresh()
  const [comments, setComments] = useState(initialComments || []);

  async function submit() {
    if (!body.trim() || !currentUserId) return;
    setLoading(true);

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      author_id: currentUserId,
      body,
      parent_id: null,
      created_at: new Date().toISOString(),
      profiles: { username: currentUsername ?? "You", avatar_url: null },
    };

    // ✅ Optimistic: append instantly, no page reload
    setComments((prev: any[]) => [...prev, optimisticComment]);
    setBody("");

    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, author_id: currentUserId, body })
      .select("*, profiles(username, avatar_url)")
      .single();

    if (error) {
      // Rollback on failure
      setComments((prev: any[]) =>
        prev.filter((c) => c.id !== optimisticComment.id),
      );
      setBody(body);
    } else {
      // Replace temp comment with real one from DB
      setComments((prev: any[]) =>
        prev.map((c) => (c.id === optimisticComment.id ? data : c)),
      );
    }

    setLoading(false);
  }

  const roots = comments.filter((c: any) => !c.parent_id);
  const replies = comments.filter((c: any) => c.parent_id);

  return (
    <div>
      <h2 className="text-sm font-semibold text-earth-400 uppercase tracking-wide mb-3">
        {comments.length} Comments
      </h2>

      {currentUserId ? (
        <div className="card p-3 mb-4 flex gap-2">
          <textarea
            className="input min-h-[60px] resize-none flex-1"
            placeholder="Add a comment…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            className="btn-primary self-end"
            onClick={submit}
            disabled={loading || !body.trim()}
          >
            {loading ? "…" : "Post"}
          </button>
        </div>
      ) : (
        <div className="card p-3 mb-4 text-center text-sm text-earth-500">
          <a href="/login" className="text-brand-400 hover:underline">
            Sign in
          </a>{" "}
          to comment
        </div>
      )}

      <div className="space-y-3">
        {roots.map((comment: any) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={replies.filter((r: any) => r.parent_id === comment.id)}
            postId={postId}
            currentUserId={currentUserId}
            onReplyAdded={(reply: any) =>
              setComments((prev: any[]) => [...prev, reply])
            }
          />
        ))}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  postId,
  currentUserId,
  onReplyAdded,
}: any) {
  const [replyBody, setReplyBody] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [localReplies, setLocalReplies] = useState(replies);

  async function submitReply() {
    if (!replyBody.trim() || !currentUserId) return;

    const optimistic = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      author_id: currentUserId,
      body: replyBody,
      parent_id: comment.id,
      created_at: new Date().toISOString(),
      profiles: { username: "You", avatar_url: null },
    };

    setLocalReplies((prev: any[]) => [...prev, optimistic]);
    setReplyBody("");
    setShowReply(false);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: currentUserId,
        body: replyBody,
        parent_id: comment.id,
      })
      .select("*, profiles(username, avatar_url)")
      .single();

    if (error) {
      setLocalReplies((prev: any[]) =>
        prev.filter((r) => r.id !== optimistic.id),
      );
    } else {
      setLocalReplies((prev: any[]) =>
        prev.map((r) => (r.id === optimistic.id ? data : r)),
      );
      onReplyAdded?.(data);
    }
  }

  return (
    <div className="card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Avatar
          src={comment.profiles?.avatar_url}
          name={comment.profiles?.username || "U"}
          size="sm"
        />
        <span className="text-xs text-earth-400">
          <span className="text-earth-300 font-medium">
            {comment.profiles?.username}
          </span>
          {" · "}
          {timeAgo(comment.created_at)}
        </span>
      </div>
      <p className="text-sm text-earth-200 leading-relaxed">{comment.body}</p>

      {currentUserId && (
        <button
          onClick={() => setShowReply(!showReply)}
          className="text-xs text-earth-500 hover:text-earth-300 mt-1 transition-colors"
        >
          Reply
        </button>
      )}

      {showReply && (
        <div className="flex gap-2 mt-2">
          <input
            className="input text-xs"
            placeholder="Reply…"
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
          />
          <button className="btn-primary text-xs px-3" onClick={submitReply}>
            →
          </button>
        </div>
      )}

      {localReplies.length > 0 && (
        <div className="mt-3 pl-4 border-l border-earth-700 space-y-2">
          {localReplies.map((r: any) => (
            <div key={r.id}>
              <span className="text-xs font-medium text-earth-300">
                {r.profiles?.username}{" "}
              </span>
              <span className="text-xs text-earth-600">
                {timeAgo(r.created_at)}
              </span>
              <p className="text-xs text-earth-300 mt-0.5">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
