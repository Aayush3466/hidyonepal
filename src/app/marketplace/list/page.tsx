"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "tent",
  "sleeping_bag",
  "clothing",
  "footwear",
  "navigation",
  "cooking",
  "safety",
  "other",
];
const CONDITIONS = ["new", "excellent", "good", "fair"];

// ✅ Singleton
const supabase = createClient();

export default function ListEquipmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [condition, setCondition] = useState("good");
  const [listingType, setListingType] = useState("rent");
  const [pricePerDay, setPricePerDay] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!contactPhone.trim() && !contactEmail.trim()) {
      setError("Please add at least one contact method");
      return;
    }
    setLoading(true);
    setError("");

    // ✅ getUser() on mutation — correct
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      router.push("/login");
      return;
    }

    const { error: insertError } = await supabase.from("equipment").insert({
      owner_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      condition,
      listing_type: listingType,
      price_per_day:
        listingType === "rent" && pricePerDay ? parseFloat(pricePerDay) : null,
      location: location.trim() || null,
      tags: tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean),
      images: [],
      is_available: true,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/marketplace");
    router.refresh();
  }

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <h1 className="text-lg font-semibold mb-4">List Your Gear</h1>
      <div className="space-y-3">
        <input
          className="input"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input min-h-[70px] resize-none"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-earth-500 mb-1 block">
              Category
            </label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-earth-500 mb-1 block">
              Condition
            </label>
            <select
              className="input"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-earth-500 mb-1 block">
              Listing Type
            </label>
            <select
              className="input"
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
            >
              <option value="rent">Rent</option>
              <option value="lend">Free Lend</option>
            </select>
          </div>
          {listingType === "rent" && (
            <div className="flex-1">
              <label className="text-xs text-earth-500 mb-1 block">
                Price/day (NPR)
              </label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
              />
            </div>
          )}
        </div>

        <input
          className="input"
          placeholder="Your location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="input"
          placeholder="Tags, comma separated"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <p className="text-xs text-earth-500 font-medium uppercase tracking-wide">
          Contact Info (at least one)
        </p>
        <input
          className="input"
          placeholder="Phone / WhatsApp / Viber number"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
        <input
          className="input"
          type="email"
          placeholder="Email address"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />

        {error && (
          <p className="text-red-400 text-xs bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <button
          className="btn-primary w-full"
          onClick={submit}
          disabled={loading || !title.trim()}
        >
          {loading ? "Listing…" : "List Gear"}
        </button>
      </div>
    </div>
  );
}
