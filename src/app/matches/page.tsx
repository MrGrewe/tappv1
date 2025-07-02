"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  name: string;
  skills: string[];
  location: string;
}

interface Match {
  id: string;
  other: Profile;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      // Alle Matches holen, bei denen user1_id oder user2_id der eigene User ist
      const { data: matchesData } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, user1:profiles!matches_user1_id_fkey(id, name, skills, location), user2:profiles!matches_user2_id_fkey(id, name, skills, location)")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      if (!matchesData) {
        setMatches([]);
        setLoading(false);
        return;
      }
      // Gegenüber-Profil bestimmen
      const myMatches = matchesData.map((m: unknown) => {
        const match = m as { id: string; user1_id: string; user2_id: string; user1: Profile; user2: Profile };
        const other = match.user1_id === user.id ? match.user2 : match.user1;
        return { id: match.id, other };
      });
      setMatches(myMatches);
      setLoading(false);
    };
    fetchMatches();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-[#18544b] text-xl font-semibold text-white">Lädt...</div>;
  }

  if (matches.length === 0) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#18544b] text-lg font-semibold text-white">Noch keine Matches.<br />Swipen, um neue Kontakte zu finden!</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#18544b] font-serif text-[#171717]">
      {/* Bildbereich (optional) */}
      <div className="hidden md:flex w-1/2 h-screen relative items-center justify-center">
        <img
          src="/logobg.jpg"
          alt="Matches"
          className="absolute inset-0 w-full h-full object-cover rounded-r-3xl"
        />
      </div>
      {/* Cards-Bereich */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white min-h-screen py-8 px-4 font-serif text-[#171717]">
        <div className="w-full max-w-xl space-y-6 font-serif text-[#171717]">
          <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-900 tracking-tight">Deine Matches</h2>
          {matches.map(match => (
            <div key={match.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3 border border-gray-100">
              <div>
                <span className="font-semibold text-lg text-gray-900">{match.other.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {match.other.skills.map(skill => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">{skill}</span>
                ))}
              </div>
              <div className="text-gray-500 text-base font-semibold">{match.other.location}</div>
              <button
                className="bg-blue-600 text-white rounded-lg py-2 font-semibold text-base mt-2 hover:bg-blue-700 active:bg-blue-800 transition shadow-md"
                onClick={() => router.push(`/chat/${match.id}`)}
              >
                Chat starten
              </button>
            </div>
          ))}
        </div>
        {/* Mobile: Bildbereich */}
        <div className="md:hidden flex flex-col items-center mt-8 w-full">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="Matches"
            className="w-full h-40 object-cover rounded-2xl mb-4"
          />
        </div>
      </div>
    </div>
  );
} 