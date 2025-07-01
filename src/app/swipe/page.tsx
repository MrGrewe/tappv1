"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import TinderCard from "react-tinder-card";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  name: string;
  bio: string;
  skills: string[];
  location: string;
}

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
      // Eigene Rolle holen
      const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!myProfile) {
        router.push("/onboarding");
        return;
      }
      // Swipes holen
      const { data: swipes } = await supabase.from("swipes").select("swiped_id").eq("swiper_id", user.id);
      const swipedIds = swipes?.map((s: unknown) => (s as { swiped_id: string }).swiped_id) || [];
      // Gegenüber-Rolle bestimmen
      const targetRole = myProfile.role === "EMPLOYER" ? "WORKER" : "EMPLOYER";
      // Profile laden, die noch nicht geswiped wurden und nicht das eigene sind
      const { data: otherProfiles } = await supabase
        .from("profiles")
        .select("id, name, bio, skills, location")
        .eq("role", targetRole)
        .not("id", "in", `(${[...swipedIds, user.id].map(id => `'${id}'`).join(",")})`);
      setProfiles(otherProfiles || []);
      setCurrent(0);
      setDone((otherProfiles || []).length === 0);
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
    return <div className="flex justify-center items-center min-h-screen">Lädt...</div>;
  }
  if (done) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">Keine weiteren Profile verfügbar.<br />Komm später wieder!</div>;
  }

  const profile = profiles[current];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-100 to-white">
      <div className="w-full max-w-xs">
        <TinderCard
          key={profile.id}
          onSwipe={dir => handleSwipe(dir, profile.id)}
          preventSwipe={['up', 'down']}
        >
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">{profile.name}</h2>
            <p className="text-gray-700 mb-2">{profile.bio}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.skills.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{skill}</span>
              ))}
            </div>
            <p className="text-gray-500 text-sm">{profile.location}</p>
          </div>
        </TinderCard>
        <div className="flex justify-between mt-6">
          <button
            className="bg-gray-300 text-gray-700 rounded-full w-14 h-14 text-2xl"
            onClick={() => handleSwipe("left", profile.id)}
          >
            ❌
          </button>
          <button
            className="bg-green-500 text-white rounded-full w-14 h-14 text-2xl"
            onClick={() => handleSwipe("right", profile.id)}
          >
            ❤️
          </button>
        </div>
      </div>
    </main>
  );
} 