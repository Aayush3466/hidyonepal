import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [supabase, user] = await Promise.all([
    createClient(),
    getCurrentUser(),
  ]);

  if (!user) redirect("/login");

  const [{ data: profile }, { count: postCount }, { count: groupCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("username, full_name, avatar_url, bio, location, trekker_level")
        .eq("id", user.id)
        .single(),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", user.id),
      supabase
        .from("group_members")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("role", ["admin", "member"]),
    ]);

  const displayName =
    profile?.username || user.email?.split("@")[0] || "Trekker";

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <div className="card p-5 mb-4">
        <div className="flex items-start gap-4 mb-4">
          <Avatar src={profile?.avatar_url} name={displayName} size="lg" />
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{displayName}</h1>
            {profile?.full_name && (
              <p className="text-earth-400 text-sm">{profile.full_name}</p>
            )}
            <p className="text-earth-500 text-xs mt-0.5">{user.email}</p>
            {profile?.location && (
              <p className="text-earth-500 text-xs flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </p>
            )}
          </div>
        </div>

        {profile?.bio && (
          <p className="text-sm text-earth-300 mb-4">{profile.bio}</p>
        )}

        <div className="flex gap-6 py-3 border-t border-earth-700 mb-4">
          <div className="text-center">
            <p className="font-bold text-lg">{postCount ?? 0}</p>
            <p className="text-xs text-earth-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{groupCount ?? 0}</p>
            <p className="text-xs text-earth-500">Rooms</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm capitalize">
              {profile?.trekker_level || "beginner"}
            </p>
            <p className="text-xs text-earth-500">Level</p>
          </div>
        </div>

        <SignOutButton />
      </div>

      <div className="space-y-2">
        {[
          { href: "/feed/create", label: "✍️ Create a Post" },
          { href: "/trek-rooms/create", label: "🏕️ Create a Trek Room" },
          { href: "/marketplace/list", label: "🎒 List Your Gear" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="card p-4 block hover:border-earth-600 transition-colors text-sm font-medium"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}