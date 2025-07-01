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
    return <div className="flex justify-center items-center min-h-screen">Lädt...</div>;
  }

  if (matches.length === 0) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">Noch keine Matches.<br />Swipen, um neue Kontakte zu finden!</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-100 to-white">
      <div className="w-full max-w-xs space-y-4">
        <h2 className="text-xl font-bold mb-4 text-center">Deine Matches</h2>
        {matches.map(match => (
          <div key={match.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
            <div>
              <span className="font-semibold text-lg">{match.other.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {match.other.skills.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{skill}</span>
              ))}
            </div>
            <div className="text-gray-500 text-sm">{match.other.location}</div>
            <button
              className="bg-blue-600 text-white rounded py-2 font-semibold mt-2 hover:bg-blue-700 transition"
              onClick={() => router.push(`/chat/${match.id}`)}
            >
              Chat starten
            </button>
          </div>
        ))}
      </div>
    </main>
  );
} 