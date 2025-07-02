"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import TinderCard from "react-tinder-card";
import { useRouter } from "next/navigation";

interface WorkerProfile {
  id: string;
  full_name: string;
  bio: string;
  skills: string[];
  location: string;
}

interface EmployerProfile {
  id: string;
  company_name: string;
  job_description: string;
  skills: string[];
  location: string;
}

type Profile =
  | {
      id: string;
      name: string;
      bio: string;
      skills: string[];
      location: string;
      type: 'WORKER';
    }
  | {
      id: string;
      name: string;
      bio: string;
      skills: string[];
      location: string;
      type: 'EMPLOYER';
    };

export default function SwipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUserId(user.id);
      // Rolle aus User-Metadaten holen
      const userRole = user.user_metadata?.role;
      if (!userRole) {
        router.push("/onboarding");
        return;
      }
      // Swipes holen
      const { data: swipes } = await supabase.from("swipes").select("swiped_id").eq("swiper_id", user.id);
      const swipedIds = swipes?.map((s: unknown) => (s as { swiped_id: string }).swiped_id) || [];
      // Gegenüber-Tabelle bestimmen
      let otherProfiles: Profile[] = [];
      if (userRole === "EMPLOYER") {
        // Arbeitgeber sieht Arbeitnehmer
        const { data } = await supabase
          .from("worker_profiles")
          .select("id, full_name, bio, skills, location");
        otherProfiles = (data as WorkerProfile[] || [])
          .filter((p) => p.id !== user.id && !swipedIds.includes(p.id))
          .map((p) => ({
            id: p.id,
            name: p.full_name,
            bio: p.bio,
            skills: p.skills || [],
            location: p.location,
            type: 'WORKER',
          }));
      } else {
        // Arbeitnehmer sieht Arbeitgeber
        const { data } = await supabase
          .from("employer_profiles")
          .select("id, company_name, job_description, skills, location");
        otherProfiles = (data as EmployerProfile[] || [])
          .filter((p) => p.id !== user.id && !swipedIds.includes(p.id))
          .map((p) => ({
            id: p.id,
            name: p.company_name,
            bio: p.job_description || '',
            skills: p.skills || [],
            location: p.location,
            type: 'EMPLOYER',
          }));
      }
      setProfiles(otherProfiles);
      setCurrent(0);
      setDone(otherProfiles.length === 0);
      setLoading(false);
    };
    fetchProfiles();
  }, [router]);

  const handleSwipe = async (direction: string, profileId: string) => {
    if (!userId) return;
    const liked = direction === "right";
    // Swipe speichern
    await supabase.from("swipes").insert({
      swiper_id: userId,
      swiped_id: profileId,
      liked,
    });
    // Bei Like prüfen, ob Gegenüber auch geliked hat
    if (liked) {
      const { data: reciprocal } = await supabase
        .from("swipes")
        .select("*")
        .eq("swiper_id", profileId)
        .eq("swiped_id", userId)
        .eq("liked", true)
        .single();
      if (reciprocal) {
        // Match anlegen (nur wenn noch nicht vorhanden)
        await supabase.rpc("create_match_if_not_exists", {
          user1: userId,
          user2: profileId,
        });
      }
    }
    // Nächstes Profil
    if (current + 1 >= profiles.length) {
      setDone(true);
    } else {
      setCurrent(current + 1);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-[#18544b] text-xl font-semibold text-white">Lädt...</div>;
  }
  if (done) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#18544b] text-lg font-semibold text-white">Keine weiteren Profile verfügbar.<br />Komm später wieder!</div>;
  }

  const profile = profiles[current];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#18544b] font-serif text-[#171717]">
      {/* Card-Bereich */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white min-h-screen py-8 px-4 font-serif text-[#171717]">
        <div className="w-full max-w-xl flex flex-col items-center font-serif text-[#171717]">
          <TinderCard
            key={profile.id}
            onSwipe={dir => handleSwipe(dir, profile.id)}
            preventSwipe={['up', 'down']}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-gray-100 w-full">
              <h2 className="text-2xl font-extrabold mb-2 text-gray-900 tracking-tight">{profile.name}</h2>
              <p className="text-gray-700 mb-4 text-base text-center font-medium">{profile.bio}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills && profile.skills.length > 0 ? profile.skills.map(skill => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">{skill}</span>
                )) : <span className="text-gray-400">Keine Skills angegeben</span>}
              </div>
              <p className="text-gray-500 text-base font-semibold">{profile.location}</p>
            </div>
          </TinderCard>
          <div className="flex justify-between mt-8 gap-8 w-full max-w-xs">
            <button
              className="bg-gray-200 text-gray-700 rounded-full w-16 h-16 text-3xl flex items-center justify-center shadow hover:bg-gray-300 active:bg-gray-400 transition"
              onClick={() => handleSwipe("left", profile.id)}
              aria-label="Dislike"
            >
              <span role="img" aria-label="Dislike">❌</span>
            </button>
            <button
              className="bg-green-500 text-white rounded-full w-16 h-16 text-3xl flex items-center justify-center shadow hover:bg-green-600 active:bg-green-700 transition"
              onClick={() => handleSwipe("right", profile.id)}
              aria-label="Like"
            >
              <span role="img" aria-label="Like">❤️</span>
            </button>
          </div>
        </div>
        {/* Mobile: Bildbereich */}
        <div className="md:hidden flex flex-col items-center mt-8 w-full">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="Swipe"
            className="w-full h-40 object-cover rounded-2xl mb-4"
          />
        </div>
      </div>
    </div>
  );
} 