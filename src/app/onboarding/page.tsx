"use client";
import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";

const INDUSTRIES = ["IT", "Handwerk", "Gesundheit", "Logistik", "Einzelhandel", "Marketing", "Büro", "Bildung", "Bau", "Sonstiges"];
const EMPLOYMENT_TYPES = ["Vollzeit", "Teilzeit", "Minijob", "Projektarbeit"];
const WORK_MODELS = ["Schicht", "flexibel", "Tagschicht", "Homeoffice", "Hybrid"];
const DESIRED_EMPLOYMENT_TYPES = ["Vollzeit", "Teilzeit", "Projekt"];

export default function Onboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [role, setRole] = useState<"EMPLOYER" | "WORKER" | null>(null);

  // Arbeitgeber-Formular
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [workModel, setWorkModel] = useState("");
  const [employerSkills, setEmployerSkills] = useState<string[]>([]);
  const [employerSkillInput, setEmployerSkillInput] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [startDate, setStartDate] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  // Arbeitnehmer-Formular
  const [fullName, setFullName] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [workerSkills, setWorkerSkills] = useState<string[]>([]);
  const [workerSkillInput, setWorkerSkillInput] = useState("");
  const [workerLocation, setWorkerLocation] = useState("");
  const [searchRadius, setSearchRadius] = useState("");
  const [desiredEmploymentTypes, setDesiredEmploymentTypes] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  // Skill-Tag-Input-Logik
  const addSkill = (type: "employer" | "worker") => {
    if (type === "employer" && employerSkillInput && !employerSkills.includes(employerSkillInput)) {
      setEmployerSkills([...employerSkills, employerSkillInput]);
      setEmployerSkillInput("");
    }
    if (type === "worker" && workerSkillInput && !workerSkills.includes(workerSkillInput)) {
      setWorkerSkills([...workerSkills, workerSkillInput]);
      setWorkerSkillInput("");
    }
  };
  const removeSkill = (type: "employer" | "worker", skill: string) => {
    if (type === "employer") setEmployerSkills(employerSkills.filter(s => s !== skill));
    if (type === "worker") setWorkerSkills(workerSkills.filter(s => s !== skill));
  };

  // Datei-Upload-Logik (Supabase Storage, optional)
  async function uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage.from("public").upload(path, file, { upsert: true });
    if (error) throw error;
    return data?.path ? supabase.storage.from("public").getPublicUrl(data.path).data.publicUrl : null;
  }

  // Formular-Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("Nicht eingeloggt");
      const userRole = user.user_metadata?.role;
      if (!userRole) throw new Error("Rolle nicht gefunden. Bitte neu einloggen.");
      let logoUrl = null;
      let photoUrl = null;
      if (role === "EMPLOYER" && companyLogo) {
        logoUrl = await uploadFile(companyLogo, `company-logos/${user.id}`);
      }
      if (role === "WORKER" && profilePhoto) {
        photoUrl = await uploadFile(profilePhoto, `profile-photos/${user.id}`);
      }
      if (role === "EMPLOYER") {
        const { error: upsertError } = await supabase.from("employer_profiles").upsert({
          id: user.id,
          company_name: companyName,
          contact_person: contactPerson,
          email: employerEmail,
          industry,
          job_title: jobTitle,
          job_description: jobDescription,
          location,
          employment_type: employmentType,
          work_model: workModel,
          skills: employerSkills,
          salary_min: salaryMin ? Number(salaryMin) : null,
          salary_max: salaryMax ? Number(salaryMax) : null,
          start_date: startDate || null,
          company_logo_url: logoUrl,
        });
        if (upsertError) throw upsertError;
      } else if (role === "WORKER") {
        const { error: upsertError } = await supabase.from("worker_profiles").upsert({
          id: user.id,
          full_name: fullName,
          email: workerEmail,
          profession,
          bio,
          skills: workerSkills,
          location: workerLocation,
          search_radius: searchRadius ? Number(searchRadius) : null,
          desired_employment_types: desiredEmploymentTypes,
          available_from: availableFrom || null,
          experience_years: experienceYears ? Number(experienceYears) : null,
          experience_text: experienceText,
          profile_photo_url: photoUrl,
        });
        if (upsertError) throw upsertError;
      }
      router.push("/swipe");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-lg bg-white/95 rounded-2xl shadow-2xl p-8 border border-gray-100">
        {!role && (
          <div className="flex flex-col gap-6 items-center">
            <h2 className="text-2xl font-extrabold mb-2 text-center text-gray-900 tracking-tight">Profiltyp wählen</h2>
            <div className="flex gap-6">
              <button onClick={() => setRole("EMPLOYER")}
                className="bg-blue-600 text-white rounded-lg px-8 py-4 font-bold text-lg shadow hover:bg-blue-700 transition">
                Arbeitgeber
              </button>
              <button onClick={() => setRole("WORKER")}
                className="bg-green-600 text-white rounded-lg px-8 py-4 font-bold text-lg shadow hover:bg-green-700 transition">
                Arbeitnehmer
              </button>
            </div>
          </div>
        )}
        {role === "EMPLOYER" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Arbeitgeber-Profil</h2>
            <input type="text" placeholder="Firmenname" className="input" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            <input type="text" placeholder="Ansprechpartner" className="input" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required />
            <input type="email" placeholder="E-Mail-Adresse" className="input" value={employerEmail} onChange={e => setEmployerEmail(e.target.value)} required />
            <select className="input" value={industry} onChange={e => setIndustry(e.target.value)} required>
              <option value="">Branche wählen</option>
              {INDUSTRIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <input type="text" placeholder="Jobtitel" className="input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required />
            <textarea placeholder="Jobbeschreibung" className="input" value={jobDescription} onChange={e => setJobDescription(e.target.value)} required />
            <input type="text" placeholder="Einsatzort" className="input" value={location} onChange={e => setLocation(e.target.value)} required />
            <select className="input" value={employmentType} onChange={e => setEmploymentType(e.target.value)} required>
              <option value="">Beschäftigungsart wählen</option>
              {EMPLOYMENT_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select className="input" value={workModel} onChange={e => setWorkModel(e.target.value)} required>
              <option value="">Arbeitszeitmodell wählen</option>
              {WORK_MODELS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div>
              <div className="flex gap-2 mb-2">
                <input type="text" placeholder="Fähigkeit hinzufügen" className="input flex-1" value={employerSkillInput} onChange={e => setEmployerSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill("employer"); }}} />
                <button type="button" onClick={() => addSkill("employer")} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-600 transition">+</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {employerSkills.map(skill => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center font-medium shadow-sm">
                    {skill}
                    <button type="button" className="ml-2 text-red-500 hover:text-red-700 font-bold" onClick={() => removeSkill("employer", skill)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input type="number" placeholder="Gehalt min (€)" className="input flex-1" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} min={0} />
              <input type="number" placeholder="Gehalt max (€)" className="input flex-1" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} min={0} />
            </div>
            <input type="date" placeholder="Startdatum" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Firmenlogo (optional)</label>
              <input type="file" accept="image/*" className="input" onChange={e => setCompanyLogo(e.target.files?.[0] || null)} />
            </div>
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-3 font-semibold text-lg mt-2 hover:bg-blue-700 active:bg-blue-800 transition shadow-md disabled:opacity-60" disabled={loading}>{loading ? "Speichern..." : "Profil speichern"}</button>
            {error && <p className="text-red-600 text-center text-base mt-2 font-medium bg-red-50 rounded p-2 border border-red-200">{error}</p>}
          </form>
        )}
        {role === "WORKER" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
            <h2 className="text-xl font-bold text-green-700 mb-2">Arbeitnehmer-Profil</h2>
            <input type="text" placeholder="Vorname und Nachname" className="input" value={fullName} onChange={e => setFullName(e.target.value)} required />
            <input type="email" placeholder="E-Mail-Adresse" className="input" value={workerEmail} onChange={e => setWorkerEmail(e.target.value)} required />
            <input type="text" placeholder="Beruf / Tätigkeit" className="input" value={profession} onChange={e => setProfession(e.target.value)} required />
            <textarea placeholder="Kurzbeschreibung" className="input" value={bio} onChange={e => setBio(e.target.value)} required />
            <div>
              <div className="flex gap-2 mb-2">
                <input type="text" placeholder="Fähigkeit hinzufügen" className="input flex-1" value={workerSkillInput} onChange={e => setWorkerSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill("worker"); }}} />
                <button type="button" onClick={() => addSkill("worker")} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-green-600 transition">+</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {workerSkills.map(skill => (
                  <span key={skill} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center font-medium shadow-sm">
                    {skill}
                    <button type="button" className="ml-2 text-red-500 hover:text-red-700 font-bold" onClick={() => removeSkill("worker", skill)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <input type="text" placeholder="Wohnort / Standort" className="input" value={workerLocation} onChange={e => setWorkerLocation(e.target.value)} required />
            <input type="number" placeholder="Suchradius in km" className="input" value={searchRadius} onChange={e => setSearchRadius(e.target.value)} min={0} required />
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Gesuchte Beschäftigungsart</label>
              <div className="flex flex-wrap gap-2">
                {DESIRED_EMPLOYMENT_TYPES.map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-base">
                    <input type="checkbox" checked={desiredEmploymentTypes.includes(opt)} onChange={e => setDesiredEmploymentTypes(e.target.checked ? [...desiredEmploymentTypes, opt] : desiredEmploymentTypes.filter(t => t !== opt))} className="accent-green-600" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <input type="date" placeholder="Verfügbarkeit ab" className="input" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} required />
            <div className="flex gap-2">
              <input type="number" placeholder="Berufserfahrung (Jahre)" className="input flex-1" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} min={0} />
              <input type="text" placeholder="Erfahrung (optional)" className="input flex-1" value={experienceText} onChange={e => setExperienceText(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Profilfoto (optional)</label>
              <input type="file" accept="image/*" className="input" onChange={e => setProfilePhoto(e.target.files?.[0] || null)} />
            </div>
            <button type="submit" className="bg-green-600 text-white rounded-lg py-3 font-semibold text-lg mt-2 hover:bg-green-700 active:bg-green-800 transition shadow-md disabled:opacity-60" disabled={loading}>{loading ? "Speichern..." : "Profil speichern"}</button>
            {error && <p className="text-red-600 text-center text-base mt-2 font-medium bg-red-50 rounded p-2 border border-red-200">{error}</p>}
          </form>
        )}
      </div>
      <style jsx global>{`
        .input {
          @apply w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition;
        }
      `}</style>
    </main>
  );
} 