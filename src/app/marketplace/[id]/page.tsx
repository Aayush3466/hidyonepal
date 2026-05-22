import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/shared/Avatar";
import { formatPrice, timeAgo } from "@/lib/utils";
import { MapPin, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/user";
import { GearActions } from "@/components/marketplace/GearActions";

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

export const dynamic = "force-dynamic";

export default async function EquipmentPage({ params }: any) {
  const [supabase, user] = await Promise.all([
    createClient(),
    getCurrentUser(),
  ]);

  const { data: item } = await supabase
    .from("equipment")
    .select("*, profiles(*)")
    .eq("id", params.id)
    .single();

  if (!item) notFound();

  const isOwner = user?.id === item.owner_id;

  const { data: activeRental } = await supabase
    .from("equipment_rentals")
    .select("*, profiles!equipment_rentals_renter_id_fkey(username)")
    .eq("equipment_id", item.id)
    .in("status", ["active", "reserved"])
    .single();

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <Link
        href="/marketplace"
        className="flex items-center gap-2 text-green-700 hover:text-green-900 text-sm mb-4 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gear
      </Link>

      <div className="card p-4 mb-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
            {EMOJI[item.category] || "🎒"}
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-lg text-gray-800 mb-1">
              {item.title}
            </h1>
            <p className="text-xl font-bold text-green-700">
              {formatPrice(item.price_per_day)}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                  item.listing_type === "lend"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
              >
                {item.listing_type === "lend" ? "Free to borrow" : "For rent"}
              </span>
              <span
                className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                  item.status === "available"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : item.status === "rented"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                }`}
              >
                {item.status === "available"
                  ? "✅ Available"
                  : item.status === "rented"
                    ? "🔴 Rented"
                    : "🟡 Reserved"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Category + Condition */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white border border-green-100 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">Category</p>
            <p className="text-sm font-semibold text-gray-800 capitalize">
              {item.category?.replace("_", " ")}
            </p>
          </div>
          <div className="bg-white border border-green-100 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">Condition</p>
            <p className="text-sm font-semibold text-gray-800 capitalize">
              {item.condition}
            </p>
          </div>
        </div>

        {/* Location */}
        {item.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-green-600" />
            {item.location}
          </div>
        )}

        {/* Tags */}
        {(item.tags || []).length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {item.tags.map((t: string) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Owner */}
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl mb-4">
          <Avatar
            src={(item.profiles as any)?.avatar_url}
            name={(item.profiles as any)?.username || "U"}
            size="md"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {(item.profiles as any)?.username}
            </p>
            <p className="text-xs text-gray-400">
              Listed {timeAgo(item.created_at)}
            </p>
          </div>
        </div>

        {/* Active rental info — owner only */}
        {isOwner && activeRental && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              Currently rented to
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {(activeRental as any).profiles?.username}
            </p>
            {activeRental.expected_return && (
              <p className="text-xs text-blue-600 mt-1">
                Expected return:{" "}
                {new Date(activeRental.expected_return).toLocaleDateString()}
              </p>
            )}
            {activeRental.note && (
              <p className="text-xs text-gray-500 mt-1">{activeRental.note}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <GearActions
          item={item}
          isOwner={isOwner}
          currentUserId={user?.id ?? null}
          activeRental={activeRental}
        />
      </div>
    </div>
  );
}
