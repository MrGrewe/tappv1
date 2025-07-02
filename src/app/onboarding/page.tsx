"use client";
import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { HiOutlineCloudUpload } from "react-icons/hi";
import React from "react";

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

  // Stepper-Design
  const PRIMARY = "#6C38FF";
  const ACCENT = "#FFD600";
  const stepsEmployer = [
    { label: "Basisdaten" },
    { label: "Jobdetails" },
    { label: "Abschluss" },
  ];
  const stepsWorker = [
    { label: "Basisdaten" },
    { label: "Fähigkeiten" },
    { label: "Abschluss" },
  ];
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

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

  const Stepper = ({ steps, current }: { steps: { label: string }[]; current: number }) => (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-8 md:mb-10">
      {steps.map((stepObj, idx) => (
        <div key={stepObj.label} className="flex items-center gap-1 md:gap-2">
          <div
            className={`rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-bold text-sm md:text-base border-2 transition-all duration-200 ${
              idx < current
                ? 'bg-[#FFD600] border-[#FFD600] text-gray-900'
                : idx === current
                ? 'bg-[#6C38FF] border-[#6C38FF] text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            {idx + 1}
          </div>
          <span className={`font-semibold text-xs md:text-base ${idx === current ? 'text-[#6C38FF]' : idx < current ? 'text-[#FFD600]' : 'text-gray-400'}`}>{stepObj.label}</span>
          {idx < steps.length - 1 && <div className="w-6 md:w-8 h-1 bg-gray-200 rounded-full" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 py-4 md:py-12 px-1 md:px-2 font-sans">
      {/* Bildbereich links (nur Desktop) */}
      <div className="hidden md:flex w-1/2 h-screen relative items-center justify-center">
        <div className="absolute inset-0 rounded-tl-[48px] rounded-br-[48px] bg-white shadow-2xl z-0" style={{ boxShadow: '0 8px 32px 0 rgba(60,60,60,0.10)' }} />
        <img
          src="/logobg.jpg"
          alt="Onboarding Hintergrund"
          className="absolute inset-0 w-full h-full object-cover rounded-tl-[48px] rounded-br-[48px] z-10 brightness-105"
          style={{ filter: 'brightness(1.08)' }}
        />
        <div className="absolute inset-0 rounded-tl-[48px] rounded-br-[48px] bg-black/20 z-20" />
      </div>
      {/* Formularbereich rechts */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-3 md:p-12 border border-gray-100 flex flex-col gap-4 md:gap-8 font-serif text-[#171717]">
          {!role && (
            <div className="flex flex-col gap-6 items-center">
              <h2 className="text-xl md:text-2xl font-extrabold mb-2 text-center text-gray-900 tracking-tight">Profiltyp wählen</h2>
              <div className="flex gap-4 md:gap-6">
                <button onClick={() => setRole("EMPLOYER")}
                  className="bg-[#6C38FF] text-white rounded-lg px-6 md:px-8 py-3 md:py-4 font-bold text-base md:text-lg shadow hover:bg-[#5a2fd1] transition">
                  Arbeitgeber
                </button>
                <button onClick={() => setRole("WORKER")}
                  className="bg-[#FFD600] text-gray-900 rounded-lg px-6 md:px-8 py-3 md:py-4 font-bold text-base md:text-lg shadow hover:bg-yellow-400 transition">
                  Arbeitnehmer
                </button>
              </div>
            </div>
          )}
          {role && !submitted && (
            <>
              <Stepper steps={role === "EMPLOYER" ? stepsEmployer : stepsWorker} current={step} />
              {/* Schritt 1: Basisdaten */}
              {step === 0 && (
                <div className="flex flex-col gap-4 md:gap-5 animate-fadein">
                  {role === "EMPLOYER" ? (
                    <>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Firmenname</label>
                        <input type="text" className={`input${companyName ? ' filled' : ''}`} value={companyName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)} required />
                        {companyName && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Ansprechpartner</label>
                        <input type="text" className={`input${contactPerson ? ' filled' : ''}`} value={contactPerson} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactPerson(e.target.value)} required />
                        {contactPerson && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">E-Mail-Adresse</label>
                        <input type="email" className={`input${employerEmail ? ' filled' : ''}`} value={employerEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployerEmail(e.target.value)} required />
                        {employerEmail && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Branche</label>
                        <select className={`input${industry ? ' filled' : ''}`} value={industry} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIndustry(e.target.value)} required>
                          <option value="">Branche wählen</option>
                          {INDUSTRIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        {industry && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Einsatzort</label>
                        <input type="text" className={`input${location ? ' filled' : ''}`} value={location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} required />
                        {location && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Vorname und Nachname</label>
                        <input type="text" className={`input${fullName ? ' filled' : ''}`} value={fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)} required />
                        {fullName && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">E-Mail-Adresse</label>
                        <input type="email" className={`input${workerEmail ? ' filled' : ''}`} value={workerEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkerEmail(e.target.value)} required />
                        {workerEmail && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Wohnort / Standort</label>
                        <input type="text" className={`input${workerLocation ? ' filled' : ''}`} value={workerLocation} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkerLocation(e.target.value)} required />
                        {workerLocation && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Suchradius in km</label>
                        <input type="number" className={`input${searchRadius ? ' filled' : ''}`} value={searchRadius} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchRadius(e.target.value)} min={0} required />
                        {searchRadius && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </>
                  )}
                  <div className="flex justify-end mt-2">
                    <button type="button" className="bg-[#6C38FF] text-white rounded-lg px-8 py-3 font-bold text-base md:text-lg shadow hover:bg-[#5a2fd1] transition" onClick={() => setStep(1)}>Weiter</button>
                  </div>
                </div>
              )}
              {/* Schritt 2: Details */}
              {step === 1 && (
                <div className="flex flex-col gap-4 md:gap-5 animate-fadein">
                  {role === "EMPLOYER" ? (
                    <>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Jobtitel</label>
                        <input type="text" className={`input${jobTitle ? ' filled' : ''}`} value={jobTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobTitle(e.target.value)} required />
                        {jobTitle && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Jobbeschreibung</label>
                        <textarea className={`input${jobDescription ? ' filled' : ''}`} value={jobDescription} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)} required />
                        {jobDescription && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Beschäftigungsart</label>
                        <select className={`input${employmentType ? ' filled' : ''}`} value={employmentType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEmploymentType(e.target.value)} required>
                          <option value="">Beschäftigungsart wählen</option>
                          {EMPLOYMENT_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        {employmentType && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Arbeitszeitmodell</label>
                        <select className={`input${workModel ? ' filled' : ''}`} value={workModel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWorkModel(e.target.value)} required>
                          <option value="">Arbeitszeitmodell wählen</option>
                          {WORK_MODELS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        {workModel && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Fähigkeit hinzufügen</label>
                        <div className="flex gap-2 mb-2">
                          <input type="text" className={`input${employerSkillInput ? ' filled' : ''}`} value={employerSkillInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployerSkillInput(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addSkill('employer'); }}} />
                          <button type="button" onClick={() => addSkill('employer')} className="bg-[#6C38FF] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-[#5a2fd1] transition">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {employerSkills.map(skill => (
                            <span key={skill} className="bg-[#6C38FF] bg-opacity-10 text-[#6C38FF] px-3 py-1 rounded-full text-xs md:text-sm flex items-center font-medium shadow-sm">
                              {skill}
                              <button type="button" className="ml-2 text-red-500 hover:text-red-700 font-bold" onClick={() => removeSkill('employer', skill)}>×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-900 mb-1">Gehalt min (€)</label>
                          <input type="number" className={`input${salaryMin ? ' filled' : ''}`} value={salaryMin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSalaryMin(e.target.value)} min={0} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-900 mb-1">Gehalt max (€)</label>
                          <input type="number" className={`input${salaryMax ? ' filled' : ''}`} value={salaryMax} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSalaryMax(e.target.value)} min={0} />
                        </div>
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Startdatum</label>
                        <input type="date" className={`input${startDate ? ' filled' : ''}`} value={startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} />
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Firmenlogo (optional)</label>
                        <div
                          className={`upload-area ${companyLogo ? 'has-file' : ''}`}
                          onClick={() => document.getElementById('companyLogoInput')?.click()}
                          tabIndex={0}
                          onKeyDown={e => { if ((e as React.KeyboardEvent<HTMLDivElement>).key === 'Enter') document.getElementById('companyLogoInput')?.click(); }}
                        >
                          <HiOutlineCloudUpload className="text-3xl text-[#6C38FF] mb-1" />
                          <span className="block text-sm text-gray-800 font-medium">{companyLogo ? companyLogo.name : 'Klicke oder ziehe eine Datei hierher'}</span>
                          <input id="companyLogoInput" type="file" accept="image/*" className="hidden" onChange={e => setCompanyLogo(e.target.files?.[0] || null)} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Beruf / Tätigkeit</label>
                        <input type="text" className={`input${profession ? ' filled' : ''}`} value={profession} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfession(e.target.value)} required />
                        {profession && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Kurzbeschreibung</label>
                        <textarea className={`input${bio ? ' filled' : ''}`} value={bio} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)} required />
                        {bio && <svg className="input-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Fähigkeit hinzufügen</label>
                        <div className="flex gap-2 mb-2">
                          <input type="text" className={`input${workerSkillInput ? ' filled' : ''}`} value={workerSkillInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkerSkillInput(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addSkill('worker'); }}} />
                          <button type="button" onClick={() => addSkill('worker')} className="bg-[#FFD600] text-gray-900 px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-400 transition">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {workerSkills.map(skill => (
                            <span key={skill} className="bg-[#FFD600] bg-opacity-20 text-[#6C38FF] px-3 py-1 rounded-full text-xs md:text-sm flex items-center font-medium shadow-sm">
                              {skill}
                              <button type="button" className="ml-2 text-red-500 hover:text-red-700 font-bold" onClick={() => removeSkill('worker', skill)}>×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Gesuchte Beschäftigungsart</label>
                        <div className="flex flex-wrap gap-2">
                          {DESIRED_EMPLOYMENT_TYPES.map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer text-base text-gray-800">
                              <input type="checkbox" checked={desiredEmploymentTypes.includes(opt)} onChange={e => setDesiredEmploymentTypes(e.target.checked ? [...desiredEmploymentTypes, opt] : desiredEmploymentTypes.filter(t => t !== opt))} className="accent-[#6C38FF]" />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Verfügbarkeit ab</label>
                        <input type="date" className={`input${availableFrom ? ' filled' : ''}`} value={availableFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvailableFrom(e.target.value)} required />
                      </div>
                      <div className="flex gap-2 mb-3">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-900 mb-1">Berufserfahrung (Jahre)</label>
                          <input type="number" className={`input${experienceYears ? ' filled' : ''}`} value={experienceYears} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExperienceYears(e.target.value)} min={0} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-900 mb-1">Erfahrung (optional)</label>
                          <input type="text" className={`input${experienceText ? ' filled' : ''}`} value={experienceText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExperienceText(e.target.value)} />
                        </div>
                      </div>
                      <div className="input-wrapper mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Profilfoto (optional)</label>
                        <div
                          className={`upload-area ${profilePhoto ? 'has-file' : ''}`}
                          onClick={() => document.getElementById('profilePhotoInput')?.click()}
                          tabIndex={0}
                          onKeyDown={e => { if ((e as React.KeyboardEvent<HTMLDivElement>).key === 'Enter') document.getElementById('profilePhotoInput')?.click(); }}
                        >
                          <HiOutlineCloudUpload className="text-3xl text-[#6C38FF] mb-1" />
                          <span className="block text-sm text-gray-800 font-medium">{profilePhoto ? profilePhoto.name : 'Klicke oder ziehe eine Datei hierher'}</span>
                          <input id="profilePhotoInput" type="file" accept="image/*" className="hidden" onChange={e => setProfilePhoto(e.target.files?.[0] || null)} />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between mt-2">
                    <button type="button" className="bg-gray-200 text-gray-800 rounded-lg px-8 py-3 font-bold text-base md:text-lg shadow hover:bg-gray-300 transition" onClick={() => setStep(0)}>Zurück</button>
                    <button type="button" className="bg-[#6C38FF] text-white rounded-lg px-8 py-3 font-bold text-base md:text-lg shadow hover:bg-[#5a2fd1] transition" onClick={() => setStep(2)}>Weiter</button>
                  </div>
                </div>
              )}
              {/* Schritt 3: Abschluss & Absenden */}
              {step === 2 && (
                <form onSubmit={async e => { await handleSubmit(e); setSubmitted(true); }} className="flex flex-col gap-5 animate-fadein">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#FFD600" /><path d="M16 24l6 6 10-10" stroke="#6C38FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <h2 className="text-xl md:text-2xl font-extrabold text-center text-gray-900">Fast geschafft!</h2>
                    <p className="text-base text-center text-gray-700">Überprüfe deine Angaben und speichere dein Profil.</p>
                  </div>
                  <button type="submit" className="bg-[#6C38FF] text-white rounded-lg py-3 font-semibold text-base md:text-lg mt-2 hover:bg-[#5a2fd1] active:bg-[#4a2499] transition shadow-md disabled:opacity-60" disabled={loading}>{loading ? "Speichern..." : "Profil speichern"}</button>
                  {error && <p className="text-red-600 text-center text-base mt-2 font-medium bg-red-50 rounded p-2 border border-red-200">{error}</p>}
                  <div className="flex justify-between mt-2">
                    <button type="button" className="bg-gray-200 text-gray-800 rounded-lg px-8 py-3 font-bold text-base md:text-lg shadow hover:bg-gray-300 transition" onClick={() => setStep(1)}>Zurück</button>
                  </div>
                </form>
              )}
            </>
          )}
          {submitted && (
            <div className="flex flex-col items-center justify-center gap-6 animate-fadein py-8 md:py-12">
              <svg width="72" height="72" fill="none" viewBox="0 0 72 72"><circle cx="36" cy="36" r="36" fill="#FFD600" /><path d="M24 36l9 9 15-15" stroke="#6C38FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h2 className="text-xl md:text-2xl font-extrabold text-center text-gray-900">Profil erfolgreich angelegt!</h2>
              <p className="text-base text-center text-gray-700">Wir haben dein Profil gespeichert und du kannst jetzt loslegen.</p>
              <button className="bg-[#6C38FF] text-white rounded-lg px-8 py-3 font-bold text-base md:text-lg shadow hover:bg-[#5a2fd1] transition" onClick={() => router.push("/swipe")}>Zum Swipen</button>
            </div>
          )}
        </div>
        <style jsx global>{`
          .input {
            @apply w-full rounded-lg border px-4 py-3 text-base font-sans focus:outline-none transition bg-white;
            border: 1.5px solid #d1d5db !important;
            color: #171717 !important;
            margin-bottom: 0.5rem;
            min-height: 48px;
            max-width: 100%;
            padding-right: 3rem;
            box-shadow: none;
          }
          .input.filled {
            border: 1.5px solid #2563eb !important;
            background: #f0f6ff !important;
          }
          .input.filled:focus {
            border: 1.5px solid #2563eb !important;
            background: #f0f6ff !important;
          }
          .input:focus {
            border: 1.5px solid #2563eb !important;
            background: #fff !important;
            box-shadow: 0 0 0 2px #2563eb22;
          }
          .input::placeholder {
            color: #bdbdbd !important;
            opacity: 1 !important;
          }
          @media (min-width: 768px) {
            .input {
              max-width: 40rem;
            }
            .input-wrapper {
              max-width: 40rem;
              margin-left: auto;
              margin-right: auto;
            }
            .onboarding-form {
              max-width: 40rem;
              margin-left: auto;
              margin-right: auto;
            }
          }
          .input-wrapper {
            position: relative;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 1.5rem;
          }
          .input-check {
            position: absolute;
            right: 1.25rem;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            height: 1.5em;
            width: 1.5em;
            color: #2563eb;
            opacity: 1;
            transition: opacity 0.2s;
            z-index: 2;
            background: transparent;
          }
          label {
            @apply text-base font-normal text-gray-800;
            margin-bottom: 0.25rem;
          }
          .onboarding-form {
            @apply flex flex-col gap-4 w-full mx-auto;
            align-items: center;
          }
          .onboarding-btn {
            @apply w-full bg-[#2563eb] text-white rounded-lg py-3 font-semibold text-lg mt-2 hover:bg-[#1d4ed8] active:bg-[#1e40af] transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2;
            letter-spacing: 0.01em;
            max-width: 100%;
          }
          .upload-area {
            @apply flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-gray-50 cursor-pointer transition p-4 w-full;
            border-color: #e5e7eb !important;
            min-height: 80px;
            margin-bottom: 0.5rem;
            background: #f5f5f5 !important;
          }
          .upload-area:hover, .upload-area:focus, .upload-area.has-file {
            border-color: #bdbdbd !important;
            background: #f5f5f5 !important;
          }
          .animate-fadein {
            animation: fadein 0.3s;
          }
          @keyframes fadein {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: none; }
          }
          @media (max-width: 640px) {
            .input, .upload-area {
              font-size: 1rem;
              min-height: 44px;
            }
            button, .input, .upload-area {
              width: 100% !important;
              max-width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
} 