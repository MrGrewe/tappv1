"use client";
import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import Logo3D from "./components/Logo3D";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<"EMPLOYER" | "WORKER">("WORKER");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignup) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role },
          },
        });
        if (signUpError) throw signUpError;
        router.push("/onboarding");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/swipe");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#18544b]">
      {/* Bild und Begrüßung */}
      <div className="hidden md:flex w-1/2 h-screen relative items-center justify-center">
        <div className="absolute inset-0 rounded-tl-[48px] rounded-br-[48px] bg-white shadow-2xl z-0" style={{ boxShadow: '0 8px 32px 0 rgba(60,60,60,0.10)' }} />
        <img
          src="/logobg.jpg"
          alt="JobMatch Hintergrund"
          className="absolute inset-0 w-full h-full object-cover rounded-tl-[48px] rounded-br-[48px] z-10 brightness-105"
          style={{ filter: 'brightness(1.08)' }}
        />
        <div className="absolute inset-0 rounded-tl-[48px] rounded-br-[48px] bg-black/30 z-20" />
        <div className="relative z-30 flex flex-col h-full justify-end p-12 pb-16">
          <div className="mb-10">
            <Logo3D />
            <span className="inline-block bg-white/80 text-gray-900 text-xs font-semibold rounded-full px-4 py-1 mb-4 shadow">JobMatch Netzwerk</span>
            <h1 className="text-3xl font-serif font-bold text-white mb-4 drop-shadow-lg" style={{ fontFamily: 'serif' }}>Finde Talente. Finde Jobs. Finde deinen perfekten Match.</h1>
            <p className="text-lg text-white/90 font-light mb-6" style={{ fontFamily: 'serif' }}>Greife auf unser Netzwerk aus über 100.000 Fachkräften und Unternehmen zu – einfach, schnell und sicher.</p>
            <div className="flex gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
                <span>100.000+ geprüfte Profile</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12h8" /></svg>
                <span>Direkter Kontakt & Projekte</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Formularbereich */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white min-h-screen py-8 px-4 font-serif text-[#171717]">
        <form onSubmit={handleAuth} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col gap-6 font-serif text-[#171717]">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Anmelden</h2>
          <p className="text-center text-gray-500 mb-2">Melde dich an, um passende Jobs oder Kandidaten zu entdecken.</p>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-1">E-Mail-Adresse</label>
            <input
              id="email"
              type="email"
              placeholder="dein@email.de"
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
        </div>
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-1">Passwort</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .512-.13.995-.354 1.412M15.12 15.12A2.978 2.978 0 0112 15c-1.657 0-3-1.343-3-3 0-.512.13-.995.354-1.412" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c1.61 0 3.117.385 4.418 1.06M21.542 12c-1.274 4.057-5.065 7-9.542 7-1.61 0-3.117-.385-4.418-1.06" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="accent-blue-600"
              />
              Angemeldet bleiben
            </label>
            <a href="#" className="text-sm text-blue-700 font-semibold hover:underline">Passwort vergessen?</a>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg py-3 font-semibold text-lg mt-2 hover:bg-blue-700 active:bg-blue-800 transition shadow-md disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Lädt..." : isSignup ? "Registrieren" : "Anmelden"}
          </button>
          <div className="text-center text-gray-500 text-sm mt-2">
            {isSignup ? (
              <>
                Du hast schon ein Konto?{' '}
                <button type="button" className="text-blue-700 font-semibold hover:underline" onClick={() => setIsSignup(false)}>Anmelden</button>
              </>
            ) : (
              <>
                Noch kein Konto?{' '}
                <button type="button" className="text-blue-700 font-semibold hover:underline" onClick={() => setIsSignup(true)}>Registrieren</button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">oder fortfahren mit</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex gap-3 justify-center">
            <button type="button" className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition flex items-center justify-center" aria-label="Mit Google anmelden">
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><circle fill="#fff" cx="24" cy="24" r="24"/><path fill="#4285F4" d="M34.6 24.2c0-.7-.1-1.4-.2-2H24v3.8h6c-.3 1.5-1.3 2.7-2.7 3.5v2.9h4.4c2.6-2.4 4.1-5.9 4.1-10.2z"/><path fill="#34A853" d="M24 36c3.2 0 5.8-1.1 7.7-2.9l-4.4-2.9c-1.2.8-2.7 1.3-4.3 1.3-3.3 0-6-2.2-7-5.2h-4.5v3.3C13.7 33.7 18.5 36 24 36z"/><path fill="#FBBC05" d="M17 26.2c-.3-.8-.5-1.6-.5-2.5s.2-1.7.5-2.5v-3.3h-4.5C11.7 20.3 12 22.1 12 24s-.3 3.7-.5 5.5l4.5-3.3z"/><path fill="#EA4335" d="M24 18.8c1.7 0 3.2.6 4.3 1.7l3.2-3.2C29.8 15.1 27.2 14 24 14c-5.5 0-10.3 2.3-13.5 6.2l4.5 3.3c1-3 3.7-5.2 7-5.2z"/></g></svg>
            </button>
            <button type="button" className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition flex items-center justify-center" aria-label="Mit Facebook anmelden">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
            </button>
            <button type="button" className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition flex items-center justify-center" aria-label="Mit Twitter anmelden">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.72 0-4.924 2.206-4.924 4.924 0 .386.045.763.127 1.124-4.09-.205-7.719-2.165-10.148-5.144-.424.729-.666 1.577-.666 2.476 0 1.708.87 3.216 2.188 4.099-.807-.026-1.566-.247-2.228-.616v.062c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.317 0-.626-.03-.928-.086.627 1.956 2.444 3.377 4.6 3.417-1.68 1.318-3.809 2.105-6.102 2.105-.396 0-.787-.023-1.175-.069 2.179 1.397 4.768 2.213 7.557 2.213 9.054 0 14.009-7.496 14.009-13.986 0-.21 0-.423-.016-.634.962-.689 1.797-1.56 2.457-2.548l-.047-.02z"/></svg>
            </button>
          </div>
          {error && <p className="text-red-600 text-center text-base mt-2 font-medium bg-red-50 rounded p-2 border border-red-200">{error}</p>}
        </form>
        {/* Mobile: Bild und Footer */}
        <div className="md:hidden flex flex-col items-center mt-8 w-full">
          <div className="relative w-full h-40 mb-4">
            <div className="absolute inset-0 rounded-tl-[32px] rounded-br-[32px] bg-white shadow-2xl z-0" style={{ boxShadow: '0 8px 32px 0 rgba(60,60,60,0.10)' }} />
            <img
              src="/logobg.jpg"
              alt="JobMatch Hintergrund"
              className="absolute inset-0 w-full h-full object-cover rounded-tl-[32px] rounded-br-[32px] z-10 brightness-105"
              style={{ filter: 'brightness(1.08)' }}
            />
            <div className="absolute inset-0 rounded-tl-[32px] rounded-br-[32px] bg-black/30 z-20" />
            <div className="absolute bottom-4 left-4 right-4 z-30">
              <h1 className="text-lg font-serif font-bold text-white mb-1 drop-shadow-lg" style={{ fontFamily: 'serif' }}>Finde Talente. Finde Jobs.</h1>
              <p className="text-xs text-white/90 font-light mb-1" style={{ fontFamily: 'serif' }}>100.000+ geprüfte Profile & Unternehmen</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-xs text-white/80">
            <span>JobMatch 2024. Alle Rechte vorbehalten.</span>
            <div className="flex gap-4">
              <a href="#" className="underline">Nutzungsbedingungen</a>
              <a href="#" className="underline">Datenschutz</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
