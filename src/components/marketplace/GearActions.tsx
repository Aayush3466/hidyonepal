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

  // ── Delete gear listing ──────────────────────────────────────────
  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    await supabase.from("equipment").delete().eq("id", item.id);
    router.push("/marketplace");
    router.refresh();
  }

  // ── Mark as rented ───────────────────────────────────────────────
  async function handleMarkRented() {
    if (!renterUsername.trim()) {
      setError("Enter renter username");
      return;
    }
    setLoading(true);
    setError("");

    // Find renter profile by username
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

    // Create rental record
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

    // Update equipment status
    await supabase
      .from("equipment")
      .update({ status: "rented", is_available: false })
      .eq("id", item.id);

    setShowRentForm(false);
    setLoading(false);
    router.refresh();
  }

  // ── Mark as reserved ─────────────────────────────────────────────
  async function handleMarkReserved() {
    setLoading(true);
    await supabase
      .from("equipment")
      .update({ status: "reserved" })
      .eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  // ── Mark as returned ─────────────────────────────────────────────
  async function handleMarkReturned() {
    setLoading(true);

    // Update rental record
    if (activeRental) {
      await supabase
        .from("equipment_rentals")
        .update({ status: "returned", returned_at: new Date().toISOString() })
        .eq("id", activeRental.id);
    }

    // Mark equipment available again
    await supabase
      .from("equipment")
      .update({ status: "available", is_available: true })
      .eq("id", item.id);

    setLoading(false);
    router.refresh();
  }

  // ── Owner view ───────────────────────────────────────────────────
  if (isOwner) {
    return (
      <div className="space-y-2">
        {/* Status management */}
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
              className="btn-ghost w-full text-yellow-400 hover:text-yellow-300"
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
              className="btn-ghost w-full"
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

        {/* Rent form */}
        {showRentForm && (
          <div className="card p-3 space-y-2 mt-2">
            <p className="text-xs font-medium text-earth-400 uppercase tracking-wide">
              Rental Details
            </p>
            <input
              className="input"
              placeholder="Renter's HidyoNepal username *"
              value={renterUsername}
              onChange={(e) => setRenterUsername(e.target.value)}
            />
            <div>
              <label className="text-xs text-earth-500 mb-1 block">
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
              <p className="text-red-400 text-xs bg-red-900/20 px-3 py-2 rounded-lg">
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

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="btn-ghost w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 mt-2"
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
      <div className="bg-earth-700/50 text-earth-400 text-sm text-center py-3 rounded-lg">
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
        <p className="text-center text-earth-500 text-sm">
          No contact info provided
        </p>
      )}
    </div>
  );
}
