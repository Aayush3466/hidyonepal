import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, MapPin, Calendar, Users } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { getCurrentUser } from "@/lib/user";

export const revalidate = 60; // refresh every 60 seconds
export default async function TrekRoomsPage() {
  // ✅ await both in parallel
  const [supabase, user] = await Promise.all([
    createClient(),
    getCurrentUser(),
  ]);

  const { data: groups } = await supabase
    .from("groups")
    .select(
      "id, name, description, location, trek_date, max_members, tags, created_at, profiles(username, avatar_url)",
    )
    .order("created_at", { ascending: false })
    .limit(30);

  const groupIds = (groups || []).map((g: any) => g.id);
  let countMap: Record<string, number> = {};

  if (groupIds.length > 0) {
    const { data: memberCounts } = await supabase
      .from("group_members")
      .select("group_id")
      .in("group_id", groupIds)
      .in("role", ["admin", "member"]);
    memberCounts?.forEach((m: any) => {
      countMap[m.group_id] = (countMap[m.group_id] ?? 0) + 1;
    });
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-semibold text-xl text-gray-800">Trek Rooms</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Find your trekking crew
          </p>
        </div>
        <Link
          href={user ? "/trek-rooms/create" : "/login"}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Room
        </Link>
      </div>

      <div className="space-y-3">
        {(groups || []).map((group: any) => {
          const memberCount = countMap[group.id] ?? 1;
          const isFull = memberCount >= group.max_members;
          return (
            <div
              key={group.id}
              className="card p-4 border-2 border-green-100 hover:border-green-300 transition-all"
            >
              <Link href={`/trek-rooms/${group.id}`} className="block">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar
                    src={group.profiles?.avatar_url}
                    name={group.profiles?.username || "U"}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h2 className="font-semibold text-sm text-gray-800 truncate">
                        {group.name}
                      </h2>
                      <span className={isFull ? "badge-full" : "badge-open"}>
                        {isFull ? "Full" : "Open"}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {group.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-600" />
                          {group.location}
                        </span>
                      )}
                      {group.trek_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-green-600" />
                          {group.trek_date}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-medium text-green-700">
                        <Users className="w-3 h-3" />
                        {memberCount}/{group.max_members} members
                      </span>
                    </div>
                  </div>
                </div>
                {(group.tags || []).length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {group.tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>

              {/* Join button visible outside */}
              <div className="border-t border-green-100 pt-3 flex items-center justify-between gap-2">
                <Link
                  href={`/trek-rooms/${group.id}`}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  View details →
                </Link>
                {!isFull ? (
                  <Link
                    href={user ? `/trek-rooms/${group.id}` : "/login"}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    {user ? "Join Room" : "Sign in to Join"}
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                    Room Full
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {(!groups || groups.length === 0) && (
          <div className="card p-10 text-center">
            <p className="text-gray-400 text-sm mb-3">No trek rooms yet.</p>
            <Link
              href={user ? "/trek-rooms/create" : "/login"}
              className="btn-primary text-sm"
            >
              Create the first one!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
