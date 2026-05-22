"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/shared/Avatar";
import { Shield, UserX, LogOut } from "lucide-react";

// ✅ One client for the entire module — never recreated
const supabase = createClient();

// ─────────────────────────────────────────────────────────────────────────────

export function JoinButton({
  groupId,
  userId,
  initialPending = false, // ← comes from server, survives navigation
}: {
  groupId: string;
  userId: string;
  initialPending?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  // ✅ initialPending from server — not hardcoded false
  // When server says isPending=true, this starts true
  // When server says no membership, this starts false
  const [isPending, setIsPending] = useState(initialPending);

  async function join() {
    setLoading(true);
    const { error } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: userId, role: "pending" });

    if (!error) {
      setIsPending(true);
    }
    setLoading(false);
  }

  if (isPending) {
    return (
      <div className="bg-earth-700 text-earth-300 text-sm text-center py-2 rounded-lg">
        Request pending admin approval…
      </div>
    );
  }

  return (
    <button className="btn-primary w-full" onClick={join} disabled={loading}>
      {loading ? "Sending request…" : "Request to Join"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Leave Button ─────────────────────────────────────────────────────────────
export function LeaveButton({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleLeave() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    await supabase
      .from("group_members")
      .delete()
      .match({ group_id: groupId, user_id: userId });
    setLoading(false);
    router.push("/trek-rooms");
    router.refresh();
  }

  return (
    <button
      onClick={handleLeave}
      disabled={loading}
      className="btn-ghost w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 mt-2"
    >
      <LogOut className="w-4 h-4" />
      {loading ? "…" : confirm ? "Tap again to confirm" : "Leave Room"}
    </button>
  );
}

export function MemberList({
  groupId,
  members: initialMembers,
  isAdmin,
  currentUserId,
}: any) {
  // ✅ Local state — mutations update UI instantly without router.refresh()
  const [members, setMembers] = useState(initialMembers || []);

  const accepted = members.filter((m: any) => m.role !== "pending");
  const pending = members.filter((m: any) => m.role === "pending");

  async function kickMember(memberId: string) {
    if (!confirm("Remove this member?")) return;
    // ✅ Optimistic: remove from UI instantly
    setMembers((prev: any[]) => prev.filter((m) => m.id !== memberId));
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("id", memberId);
    if (error) {
      // Rollback on failure — re-fetch would be needed here, simplest is alert
      alert("Failed to remove member. Please refresh.");
    }
  }

  async function acceptMember(memberId: string) {
    // ✅ Optimistic: flip role to 'member' instantly
    setMembers((prev: any[]) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: "member" } : m)),
    );
    const { error } = await supabase
      .from("group_members")
      .update({ role: "member" })
      .eq("id", memberId);
    if (error) {
      // Rollback
      setMembers((prev: any[]) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: "pending" } : m)),
      );
    }
  }

  async function rejectMember(memberId: string) {
    // ✅ Optimistic: remove from list instantly
    setMembers((prev: any[]) => prev.filter((m) => m.id !== memberId));
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("id", memberId);
    if (error) {
      alert("Failed to reject member. Please refresh.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Members ({accepted.length})
        </h3>
        <div className="space-y-2">
          {accepted.map((m: any) => (
            <div key={m.id} className="flex items-center gap-3">
              <Avatar
                src={m.profiles?.avatar_url}
                name={m.profiles?.username || "U"}
                size="sm"
              />
              <span className="text-sm flex-1 text-gray-800 font-medium">
                {m.profiles?.username}
              </span>{" "}
              {m.role === "admin" && (
                <Shield className="w-3.5 h-3.5 text-brand-400" />
              )}
              {isAdmin && m.user_id !== currentUserId && m.role !== "admin" && (
                <button
                  onClick={() => kickMember(m.id)}
                  className="p-1 rounded hover:bg-red-900/30 text-earth-600 hover:text-red-400 transition-colors"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isAdmin && pending.length > 0 && (
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Pending Requests ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar
                  src={m.profiles?.avatar_url}
                  name={m.profiles?.username || "U"}
                  size="sm"
                />
                <span className="text-sm flex-1">{m.profiles?.username}</span>
                <button
                  onClick={() => acceptMember(m.id)}
                  className="text-xs bg-green-800 hover:bg-green-700 text-green-200 px-2 py-1 rounded transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectMember(m.id)}
                  className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-2 py-1 rounded transition-colors"
                >
                  Reject
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function BoardPostForm({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  // ✅ Local posts state for optimistic append — no router.refresh()
  const [localPosts, setLocalPosts] = useState<any[]>([]);

  async function submit() {
    if (!body.trim()) return;
    setLoading(true);

    const optimistic = {
      id: `temp-${Date.now()}`,
      group_id: groupId,
      author_id: userId,
      body,
      created_at: new Date().toISOString(),
      profiles: { username: "You", avatar_url: null },
    };

    // ✅ Show post instantly
    setLocalPosts((prev) => [optimistic, ...prev]);
    setBody("");
    setLoading(false);

    const { data, error } = await supabase
      .from("group_posts")
      .insert({ group_id: groupId, author_id: userId, body: optimistic.body })
      .select("*, profiles(username, avatar_url)")
      .single();

    if (error) {
      // Rollback
      setLocalPosts((prev) => prev.filter((p) => p.id !== optimistic.id));
      setBody(optimistic.body);
    } else {
      // Replace temp with real
      setLocalPosts((prev) =>
        prev.map((p) => (p.id === optimistic.id ? data : p)),
      );
    }
  }

  return (
    <div className="space-y-3">
      <div className="card p-3 flex gap-2">
        <textarea
          className="input min-h-[60px] resize-none flex-1"
          placeholder="Post to the board…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          className="btn-primary self-end"
          onClick={submit}
          disabled={loading || !body.trim()}
        >
          Post
        </button>
      </div>

      {/* ✅ Optimistically rendered posts appear here instantly */}
      {localPosts.length > 0 && (
        <div className="space-y-3">
          {localPosts.map((post: any) => (
            <div key={post.id} className="card p-4 opacity-90">
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
                  {" · "}just now
                </span>
              </div>
              <p className="text-sm text-earth-200 leading-relaxed">
                {post.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
