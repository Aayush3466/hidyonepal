"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const TREKKER_LEVELS = ["beginner", "intermediate", "advanced", "expert"];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [trekkerLevel, setTrekkerLevel] = useState("beginner");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setFullName(profile.full_name || "");
        setBio(profile.bio || "");
        setLocation(profile.location || "");
        setAvatarUrl(profile.avatar_url || "");
        setTrekkerLevel(profile.trekker_level || "beginner");
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleSave() {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Check username uniqueness (excluding current user)
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim())
      .neq("id", user.id)
      .single();

    if (existing) {
      setError("Username already taken");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        trekker_level: trekkerLevel,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    setTimeout(() => router.push("/profile"), 1000);
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-3 py-8 text-center text-earth-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <h1 className="text-lg font-semibold mb-4">Edit Profile</h1>
      <div className="card p-5 space-y-3">
        <div>
          <label className="text-xs text-earth-500 mb-1 block">
            Username *
          </label>
          <input
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={30}
          />
        </div>

        <div>
          <label className="text-xs text-earth-500 mb-1 block">Full Name</label>
          <input
            className="input"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={60}
          />
        </div>

        <div>
          <label className="text-xs text-earth-500 mb-1 block">Bio</label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Tell the community about yourself…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
          />
          <p className="text-xs text-earth-600 mt-1 text-right">
            {bio.length}/300
          </p>
        </div>

        <div>
          <label className="text-xs text-earth-500 mb-1 block">Location</label>
          <input
            className="input"
            placeholder="e.g. Kathmandu, Nepal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={60}
          />
        </div>

        <div>
          <label className="text-xs text-earth-500 mb-1 block">
            Trekker Level
          </label>
          <select
            className="input"
            value={trekkerLevel}
            onChange={(e) => setTrekkerLevel(e.target.value)}
          >
            {TREKKER_LEVELS.map((l) => (
              <option key={l} value={l} className="capitalize">
                {l}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-400 text-xs bg-green-900/20 px-3 py-2 rounded-lg">
            Profile saved! Redirecting…
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            className="btn-ghost flex-1"
            onClick={() => router.push("/profile")}
          >
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            onClick={handleSave}
            disabled={saving || !username.trim()}
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
