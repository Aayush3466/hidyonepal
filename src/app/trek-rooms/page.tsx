import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, MapPin, Calendar, Users } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { getCurrentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function TrekRoomsPage() {
  // ✅ await both in parallel
  const [supabase, user] = await Promise.all([
    createClient(),
    getCurrentUser(),
  ]);

  const { data: groups } = await supabase
    .from("groups")
.select("id, name, description, location, trek_date, max_members, tags, created_at, profiles(username, avatar_url)")    .order("created_at", { ascending: false })
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
    <div className="max-w-xl mx-auto px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-lg">Trek Rooms</h1>
        <Link
          href={user ? "/trek-rooms/create" : "/login"}
          className="btn-primary flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> New Room
        </Link>
      </div>

      <div className="space-y-3">
        {(groups || []).map((group: any) => {
          const memberCount = countMap[group.id] ?? 1;
          const isFull = memberCount >= group.max_members;
          return (
            <Link
              key={group.id}
              href={`/trek-rooms/${group.id}`}
              className="card p-4 block hover:border-earth-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar
                  src={group.profiles?.avatar_url}
                  name={group.profiles?.username || "U"}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-sm truncate">{group.name}</h2>
                    <span className={isFull ? "badge-full" : "badge-open"}>
                      {isFull ? "Full" : "Open"}
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-xs text-earth-400 line-clamp-2 mb-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-earth-500">
                    {group.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{group.location}
                      </span>
                    )}
                    {group.trek_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{group.trek_date}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {memberCount}/{group.max_members}
                    </span>
                  </div>
                </div>
              </div>
              {(group.tags || []).length > 0 && (
                <div className="flex gap-1 mt-2 ml-12">
                  {group.tags.slice(0, 3).map((t: string) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
        {(!groups || groups.length === 0) && (
          <div className="card p-8 text-center text-earth-500">
            No trek rooms yet. Create one!
          </div>
        )}
      </div>
    </div>
  );
}