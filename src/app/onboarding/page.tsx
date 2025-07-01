"use client";
import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
    }
  };
  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("Nicht eingeloggt");
      const role = user.user_metadata?.role;
      if (!role) throw new Error("Rolle nicht gefunden. Bitte neu einloggen.");
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        name,
        bio,
        skills,
        location,
        role,
      });
      if (upsertError) throw upsertError;
      router.push("/swipe");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-900 tracking-tight">Profil anlegen</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Kurzbeschreibung (Bio)"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[60px]"
            value={bio}
            onChange={e => setBio(e.target.value)}
            required
          />
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Skill hinzufügen"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
              />
              <button type="button" onClick={addSkill} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-600 transition">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center font-medium shadow-sm">
                  {skill}
                  <button type="button" className="ml-2 text-red-500 hover:text-red-700 font-bold" onClick={() => removeSkill(skill)}>×</button>
                </span>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Standort"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg py-3 font-semibold text-lg mt-2 hover:bg-blue-700 active:bg-blue-800 transition shadow-md disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Speichern..." : "Profil speichern"}
          </button>
        </form>
        {error && <p className="text-red-600 text-center text-base mt-4 font-medium bg-red-50 rounded p-2 border border-red-200">{error}</p>}
      </div>
    </main>
  );
} 