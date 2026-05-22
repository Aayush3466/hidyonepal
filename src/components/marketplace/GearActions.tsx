"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Users, CheckCircle } from "lucide-react";

const supabase = createClient();

export function GearActions({
  item,
  isOwner,
  currentUserId,
  activeRental,
}: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRentForm, setShowRentForm] = useState(false);
  const [renterUsername, setRenterUsername] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    await supabase.from("equipment").delete().eq("id", item.id);
    router.push("/marketplace");
  }

  async function handleMarkRented() {
    if (!renterUsername.trim()) {
      setError("Enter renter username");
      return;
    }
    setLoading(true);
    setError("");

    const { data: renterProfile } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", renterUsername.trim())
      .single();

    if (!renterProfile) {
      setError("Username not found — they must be registered on HidyoNepal");
      setLoading(false);
      return;
    }

    const { error: rentalError } = await supabase
      .from("equipment_rentals")
      .insert({
        equipment_id: item.id,
        owner_id: item.owner_id,
        renter_id: renterProfile.id,
        status: "active",
        note: note.trim() || null,
        expected_return: expectedReturn || null,
      });

    if (rentalError) {
      setError(rentalError.message);
      setLoading(false);
      return;
    }

    await supabase
      .from("equipment")
      .update({ status: "rented", is_available: false })
      .eq("id", item.id);

    setShowRentForm(false);
    setLoading(false);
    window.location.reload();
  }

  async function handleMarkReserved() {
    setLoading(true);
    await supabase
      .from("equipment")
      .update({ status: "reserved" })
      .eq("id", item.id);
    setLoading(false);
    window.location.reload();
  }

  async function handleMarkReturned() {
    setLoading(true);
    if (activeRental) {
      await supabase
        .from("equipment_rentals")
        .update({ status: "returned", returned_at: new Date().toISOString() })
        .eq("id", activeRental.id);
    }
    await supabase
      .from("equipment")
      .update({ status: "available", is_available: true })
      .eq("id", item.id);
    setLoading(false);
    window.location.reload();
  }

  // ── Owner view ───────────────────────────────────────────────────
  if (isOwner) {
    return (
      <div className="space-y-2">
        {item.status === "available" && (
          <>
            <button
              onClick={() => setShowRentForm(!showRentForm)}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Mark as Rented
            </button>
            <button
              onClick={handleMarkReserved}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-all"
            >
              🟡 Mark as Reserved
            </button>
          </>
        )}

        {item.status === "reserved" && (
          <>
            <button
              onClick={() => setShowRentForm(!showRentForm)}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Mark as Rented
            </button>
            <button
              onClick={handleMarkReturned}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-all"
            >
              ✅ Mark as Available
            </button>
          </>
        )}

        {item.status === "rented" && (
          <button
            onClick={handleMarkReturned}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {loading ? "Updating…" : "Mark as Returned"}
          </button>
        )}

        {showRentForm && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3 mt-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Rental Details
            </p>
            <input
              className="input"
              placeholder="Renter's HidyoNepal username *"
              value={renterUsername}
              onChange={(e) => setRenterUsername(e.target.value)}
            />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Expected Return Date
              </label>
              <input
                type="date"
                className="input"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
              />
            </div>
            <input
              className="input"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {error && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}
            <button
              className="btn-primary w-full"
              onClick={handleMarkRented}
              disabled={loading || !renterUsername.trim()}
            >
              {loading ? "Saving…" : "Confirm Rental"}
            </button>
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 transition-all mt-1"
        >
          <Trash2 className="w-4 h-4" />
          {confirmDelete ? "Tap again to confirm delete" : "Delete Listing"}
        </button>
      </div>
    );
  }

  // ── Non-owner view ───────────────────────────────────────────────
  if (!currentUserId) {
    return (
      <a href="/login" className="btn-primary w-full text-center block">
        Sign in to contact owner
      </a>
    );
  }

  if (item.status !== "available") {
    return (
      <div
        className={`text-sm text-center py-3 px-4 rounded-xl font-medium border ${
          item.status === "rented"
            ? "bg-red-50 text-red-600 border-red-200"
            : "bg-yellow-50 text-yellow-600 border-yellow-200"
        }`}
      >
        {item.status === "rented"
          ? "🔴 Currently rented out"
          : "🟡 Currently reserved"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {item.contact_phone && (
        <div className="flex gap-2">
          <a
            href={`tel:${item.contact_phone}`}
            className="btn-primary flex-1 text-center"
          >
            📞 Call
          </a>
          <a
            href={`https://wa.me/${item.contact_phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-center"
          >
            💬 WhatsApp
          </a>
          <a
            href={`viber://chat?number=${item.contact_phone.replace(/\D/g, "")}`}
            className="btn-primary flex-1 text-center"
          >
            📲 Viber
          </a>
        </div>
      )}
      {item.contact_email && (
        <a
          href={`mailto:${item.contact_email}?subject=Inquiry about ${item.title} on HidyoNepal`}
          className="btn-primary w-full text-center block"
        >
          ✉️ Email Owner
        </a>
      )}
      {!item.contact_phone && !item.contact_email && (
        <p className="text-center text-gray-400 text-sm py-2">
          No contact info provided
        </p>
      )}
    </div>
  );
}
