import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { formatPrice, timeAgo } from "@/lib/utils";
import { MapPin } from "lucide-react";

const EMOJI: Record<string, string> = {
  tent: "⛺", sleeping_bag: "🛏️", clothing: "🧥", footwear: "👟",
  navigation: "🧭", cooking: "🍳", safety: "🪖", other: "🎒",
};

export default async function EquipmentPage({ params }: any) {
  // ✅ await createClient
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("equipment")
    .select("*, profiles(*)")
    .eq("id", params.id)
    .single();

  if (!item) notFound();

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <div className="card p-4 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-20 h-20 bg-earth-700 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
            {EMOJI[item.category] || "🎒"}
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-lg mb-1">{item.title}</h1>
            <p className="text-xl font-bold text-brand-400">
              {formatPrice(item.price_per_day)}
            </p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${item.listing_type === "lend" ? "bg-green-900/50 text-green-400" : "bg-blue-900/50 text-blue-400"}`}>
              {item.listing_type === "lend" ? "Free to borrow" : "For rent"}
            </span>
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-earth-300 mb-3">{item.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-earth-700/50 rounded-lg p-2">
            <p className="text-xs text-earth-500">Category</p>
            <p className="text-sm font-medium capitalize">
              {item.category?.replace("_", " ")}
            </p>
          </div>
          <div className="bg-earth-700/50 rounded-lg p-2">
            <p className="text-xs text-earth-500">Condition</p>
            <p className="text-sm font-medium capitalize">{item.condition}</p>
          </div>
        </div>

        {item.location && (
          <div className="flex items-center gap-2 text-sm text-earth-400 mb-3">
            <MapPin className="w-4 h-4" />{item.location}
          </div>
        )}

        {(item.tags || []).length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {item.tags.map((t: string) => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 p-3 bg-earth-700/50 rounded-lg mb-3">
          <Avatar
            src={(item.profiles as any)?.avatar_url}
            name={(item.profiles as any)?.username || "U"}
            size="md"
          />
          <div>
            <p className="text-sm font-medium">{(item.profiles as any)?.username}</p>
            <p className="text-xs text-earth-500">Listed {timeAgo(item.created_at)}</p>
          </div>
        </div>

        <button className="btn-primary w-full">Contact Owner</button>
      </div>
    </div>
  );
}