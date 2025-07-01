"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient";

export default function MobileNav() {
  const router = useRouter();
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-14 z-50 shadow md:hidden">
      <Link href="/swipe" className="flex flex-col items-center text-xs">
        <span>🔄</span>
        <span>Swipe</span>
      </Link>
      <Link href="/matches" className="flex flex-col items-center text-xs">
        <span>💬</span>
        <span>Matches</span>
      </Link>
      <Link href="/onboarding" className="flex flex-col items-center text-xs">
        <span>👤</span>
        <span>Profil</span>
      </Link>
      <button onClick={handleLogout} className="flex flex-col items-center text-xs text-red-500">
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </nav>
  );
} 