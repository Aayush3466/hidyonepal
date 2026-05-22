import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Users } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { JoinButton, LeaveButton, MemberList } from "@/components/trek-rooms";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user";
import { ArrowLeft } from "lucide-react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export const dynamic = "force-dynamic";

export default async function TrekRoomPage({ params }: any) {
  const [supabase, user] = await Promise.all([
    createClient(),
    getCurrentUser(),
  ]);

  const [{ data: group }, { data: members }] = await Promise.all([
    supabase
      .from("groups")
      .select(
        "id, name, description, location, trek_date, max_members, tags, status, is_private, profiles(username, avatar_url)",
      )
      .eq("id", params.id)
      .single(),
    supabase
      .from("group_members")
      .select("id, user_id, role, joined_at, profiles(username, avatar_url)")
      .eq("group_id", params.id)
      .order("joined_at", { ascending: true }),
  ]);

  if (!group) notFound();

  const allMembers = members || [];
  const acceptedMembers = allMembers.filter((m: any) => m.role !== "pending");
  const userMembership = user
    ? allMembers.find((m: any) => m.user_id === user.id)
    : null;
  const isAdmin = userMembership?.role === "admin";
  const isMember = userMembership?.role === "member" || isAdmin;
  const isPending = userMembership?.role === "pending";
  const isFull = acceptedMembers.length >= group.max_members;

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <Link
        href="/trek-rooms"
        className="flex items-center gap-2 text-earth-400 hover:text-earth-200 text-sm mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Rooms
      </Link>

      {/* ── Group info card ── */}
      <div className="card p-4 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar
            src={(group.profiles as any)?.avatar_url}
            name={(group.profiles as any)?.username || "U"}
            size="lg"
          />
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{group.name}</h1>
            <p className="text-xs text-earth-500">
              by {(group.profiles as any)?.username}
            </p>
          </div>
          <span className={isFull ? "badge-full" : "badge-open"}>
            {isFull ? "Full" : "Open"}
          </span>
        </div>

        {group.description && (
          <p className="text-sm text-earth-300 mb-3">{group.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-earth-400 mb-3">
          {group.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {group.location}
            </span>
          )}
          {group.trek_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {group.trek_date}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {acceptedMembers.length}/{group.max_members}
          </span>
        </div>

        {(group.tags || []).length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {group.tags.map((t: string) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* ── CTA buttons ── */}
        {isMember && (
          <>
            <Link
              href={`/trek-rooms/${group.id}/board`}
              className="btn-primary w-full text-center block"
            >
              Open Group Board
            </Link>
            {!isAdmin && <LeaveButton groupId={group.id} userId={user!.id} />}
          </>
        )}
        {!user && (
          <Link href="/login" className="btn-primary w-full text-center block">
            Sign in to join
          </Link>
        )}
        {user && !isMember && !isFull && (
          <JoinButton
            groupId={group.id}
            userId={user.id}
            initialPending={isPending}
          />
        )}
        {user && !userMembership && isFull && (
          <div className="bg-earth-700 text-earth-500 text-sm text-center py-2 rounded-lg">
            Group is full
          </div>
        )}
      </div>
      {/* ── end card ── */}

      {/* ── Member list — separate from card, has its own error boundary ── */}
      <ErrorBoundary>
        <MemberList
          groupId={group.id}
          members={allMembers}
          isAdmin={isAdmin}
          currentUserId={user?.id}
        />
      </ErrorBoundary>
    </div> // ── end page wrapper ──
  );
}
