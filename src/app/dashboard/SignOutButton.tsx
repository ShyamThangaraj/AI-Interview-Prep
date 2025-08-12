// app/dashboard/SignOutButton.tsx
"use client";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
      className="px-4 py-2 border border-white hover:bg-white hover:text-black text-white rounded transition"
    >
      Sign Out
    </button>
  );
}