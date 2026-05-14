"use client";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Full reload so server clears the cookie immediately — same reason as login
    window.location.href = "/login";
  }
  return (
    <button
      onClick={signOut}
      className="flex items-center gap-2 btn-ghost text-red-400 hover:text-red-300"
    >
      <LogOut className="w-4 h-4" /> Sign Out
    </button>
  );
}
