import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { formatPrice } from "@/lib/utils";
import { getCurrentUser } from "@/lib/user";

export const revalidate = 60; // refresh every 60 seconds

const CATEGORIES = [
  "all",
  "tent",
  "sleeping_bag",
  "clothing",
  "footwear",
  "navigation",
  "cooking",
  "safety",
];
const EMOJI: Record<string, string> = {
  tent: "⛺",
  sleeping_bag: "🛏️",
  clothing: "🧥",
  footwear: "👟",
  navigation: "🧭",
  cooking: "🍳",
  safety: "🪖",
  other: "🎒",
};

export default async function MarketplacePage({ searchParams }: any) {
  // ✅ await both in parallel
  const [supabase, user] = await Promise.all([
    createClient(),
    getCurrentUser(),
  ]);

  const category = searchParams?.category;
  const listingType = searchParams?.type;

  let query = supabase
    .from("equipment")
    .select(
      "id, title, category, condition, listing_type, price_per_day, location, tags, is_available, created_at, profiles(username, avatar_url)",
    )
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(30);

  if (category && category !== "all")
    query = (query as any).eq("category", category);
  if (listingType) query = (query as any).eq("listing_type", listingType);

  const { data: items } = await query;

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-lg">Gear Market</h1>
        <Link
          href={user ? "/marketplace/list" : "/login"}
          className="btn-primary flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> List Gear
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={c === "all" ? "/marketplace" : `/marketplace?category=${c}`}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-colors capitalize ${(category ?? "all") === c ? "bg-brand-600 text-white" : "bg-earth-800 text-earth-400"}`}
          >
            {c.replace("_", " ")}
          </Link>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "rent", "lend"].map((t) => (
          <Link
            key={t}
            href={`/marketplace${t !== "all" ? `?type=${t}` : ""}${category && category !== "all" ? `${t !== "all" ? "&" : "?"}category=${category}` : ""}`}
            className={`text-xs px-3 py-1 rounded-lg capitalize transition-colors ${(listingType ?? "all") === t ? "bg-earth-700 text-earth-100" : "text-earth-500 hover:text-earth-300"}`}
          >
            {t === "lend" ? "Free Lend" : t === "all" ? "All Types" : "Rent"}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {(items || []).map((item: any) => (
          <Link
            key={item.id}
            href={`/marketplace/${item.id}`}
            className="card p-4 block hover:border-earth-600 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-earth-700 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">
                {EMOJI[item.category] || "🎒"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-medium text-sm truncate">{item.title}</h2>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${item.listing_type === "lend" ? "bg-green-900/50 text-green-400" : "bg-blue-900/50 text-blue-400"}`}
                  >
                    {item.listing_type === "lend" ? "Free" : "Rent"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-brand-400">
                  {formatPrice(item.price_per_day)}
                </p>
                <div className="flex items-center gap-3 text-xs text-earth-500 mt-1">
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                  )}
                  <span className="capitalize">{item.condition}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Avatar
                    src={item.profiles?.avatar_url}
                    name={item.profiles?.username || "U"}
                    size="sm"
                  />
                  <span className="text-xs text-earth-500">
                    {item.profiles?.username}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {(!items || items.length === 0) && (
          <div className="card p-8 text-center text-earth-500">
            No gear listed yet.
          </div>
        )}
      </div>
    </div>
  );
}
