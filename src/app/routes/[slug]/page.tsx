import { notFound } from "next/navigation";
import { getRoute, DIFFICULTY_COLOR } from "@/lib/trek-routes";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  MapPin,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Star,
  Users,
  ArrowLeft,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/shared/Avatar";
import { WeatherWidget } from "@/components/routes/WeatherWidget";

export async function generateMetadata({ params }: any) {
  const route = getRoute(params.slug);
  if (!route) return {};
  return {
    title: `${route.name} Trek Guide | HidyoNepal`,
    description: route.description,
  };
}

export const dynamic = "force-dynamic";

export default async function RouteDetailPage({ params }: any) {
  const route = getRoute(params.slug);
  if (!route) notFound();

  const supabase = await createClient();

  // Pull community posts tagged with this route
  // Searches title + tags for any of the route's feedTags
  const tagQueries = route.feedTags.map((tag) =>
    supabase
      .from("posts")
      .select(
        "id, title, body, vote_count, comment_count, created_at, profiles(username, avatar_url)",
      )
      .or(`title.ilike.%${tag}%,tags.cs.{${tag}}`)
      .order("vote_count", { ascending: false })
      .limit(3),
  );

  // Pull active trek rooms for this route
  const roomQuery = supabase
    .from("groups")
    .select("id, name, location, trek_date, max_members, profiles(username)")
    .or(route.feedTags.map((t) => `name.ilike.%${t}%`).join(","))
    .order("created_at", { ascending: false })
    .limit(4);

  const [roomResult, ...postResults] = await Promise.all([
    roomQuery,
    ...tagQueries,
  ]);

  // Deduplicate posts across tag queries
  const seenIds = new Set<string>();
  const communityPosts: any[] = [];
  for (const result of postResults) {
    for (const post of result.data || []) {
      if (!seenIds.has(post.id) && communityPosts.length < 6) {
        seenIds.add(post.id);
        communityPosts.push(post);
      }
    }
  }

  const activeRooms = roomResult.data || [];

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <Link
        href="/routes"
        className="flex items-center gap-2 text-earth-400 hover:text-earth-200 text-sm mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Routes
      </Link>
      {/* ── Header ── */}
      <div className="card p-4 mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-xl font-semibold">{route.name}</h1>
          <span
            className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${DIFFICULTY_COLOR[route.difficulty]}`}
          >
            {route.difficulty}
          </span>
        </div>
        <p className="text-xs text-earth-500 mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {route.region}
        </p>
        <p className="text-sm text-earth-300 leading-relaxed mb-4">
          {route.description}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: "Duration", value: route.duration, icon: Clock },
            {
              label: "Max Altitude",
              value: route.maxAltitude,
              icon: TrendingUp,
            },
            { label: "Distance", value: route.distance, icon: MapPin },
            { label: "Best Season", value: route.bestSeason, icon: Calendar },
            { label: "Start", value: route.startPoint, icon: MapPin },
            { label: "End", value: route.endPoint, icon: MapPin },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-earth-700/50 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Icon className="w-3 h-3 text-earth-500" />
                <p className="text-xs text-earth-500">{label}</p>
              </div>
              <p className="text-xs font-medium text-earth-200">{value}</p>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="mb-4">
          <p className="text-xs font-medium text-earth-500 uppercase tracking-wide mb-2">
            Highlights
          </p>
          <div className="flex flex-wrap gap-1">
            {route.highlights.map((h) => (
              <span key={h} className="flex items-center gap-1 tag">
                <Star className="w-2.5 h-2.5" />
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {route.tags.map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Cost Section ── */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-brand-400" />
          <h2 className="font-semibold text-sm">Estimated Cost</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-earth-700/50 rounded-lg p-3">
            <p className="text-xs text-earth-500 mb-1">🇳🇵 Nepali Trekkers</p>
            <p className="text-sm font-semibold text-brand-400">
              {route.costNepali}
            </p>
          </div>
          <div className="bg-earth-700/50 rounded-lg p-3">
            <p className="text-xs text-earth-500 mb-1">🌍 International</p>
            <p className="text-xs font-semibold text-earth-200 leading-relaxed">
              {route.costInternational}
            </p>
          </div>
        </div>
        <p className="text-xs text-earth-500 leading-relaxed bg-earth-700/30 rounded-lg p-3">
          💡 {route.costNote}
        </p>
      </div>

      {/* ── Permits ── */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-brand-400" />
          <h2 className="font-semibold text-sm">Permits Required</h2>
        </div>
        <p className="text-xs text-earth-300 leading-relaxed">{route.permit}</p>
      </div>

      {/* ── Weather ── */}
      <div className="card p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3">
          📍 Current Weather — {route.startPoint.split("(")[0].trim()}
        </h2>
        <WeatherWidget lat={route.weatherLat} lon={route.weatherLon} />
      </div>

      {/* ── Active Trek Rooms ── */}
      {activeRooms.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              Active Trek Rooms
            </h2>
            <Link
              href="/trek-rooms"
              className="text-xs text-brand-400 hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {activeRooms.map((room: any) => (
              <Link
                key={room.id}
                href={`/trek-rooms/${room.id}`}
                className="card p-3 block hover:border-earth-600 transition-colors"
              >
                <p className="text-sm font-medium text-earth-200">
                  {room.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-earth-500 mt-1">
                  {room.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {room.location}
                    </span>
                  )}
                  {room.trek_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {room.trek_date}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Community Posts ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">Community Reports</h2>
          <Link
            href={`/feed/create`}
            className="text-xs text-brand-400 hover:underline"
          >
            + Share your experience
          </Link>
        </div>
        {communityPosts.length > 0 ? (
          <div className="space-y-2">
            {communityPosts.map((post: any) => (
              <Link
                key={post.id}
                href={`/feed/${post.id}`}
                className="card p-3 block hover:border-earth-600 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
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
                <p className="text-sm font-medium text-earth-200 mb-1">
                  {post.title}
                </p>
                {post.body && (
                  <p className="text-xs text-earth-500 line-clamp-2">
                    {post.body}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-earth-600 mt-2">
                  <span>▲ {post.vote_count || 0}</span>
                  <span>💬 {post.comment_count || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-earth-500 text-sm mb-2">
              No community reports yet for this route.
            </p>
            <Link href="/feed/create" className="btn-primary text-xs">
              Be the first to share!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
