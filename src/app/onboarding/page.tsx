"use client";
import { useState } from "react";
import { supabase } from "../layout";
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
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        name,
        bio,
        skills,
        location,
      });
      if (upsertError) throw upsertError;
      router.push("/swipe");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-100 to-white">
      <div className="w-full max-w-xs bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Profil anlegen</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered w-full rounded px-3 py-2 border"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Kurzbeschreibung (Bio)"
            className="input input-bordered w-full rounded px-3 py-2 border min-h-[60px]"
            value={bio}
            onChange={e => setBio(e.target.value)}
            required
          />
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Skill hinzufügen"
                className="input input-bordered rounded px-3 py-2 border flex-1"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
              />
              <button type="button" onClick={addSkill} className="bg-blue-500 text-white px-3 py-1 rounded">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center">
                  {skill}
                  <button type="button" className="ml-1 text-red-500" onClick={() => removeSkill(skill)}>×</button>
                </span>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Standort"
            className="input input-bordered w-full rounded px-3 py-2 border"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded py-2 font-semibold mt-2 hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Speichern..." : "Profil speichern"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </main>
  );
} 