"use client";
import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900 tracking-tight">JobMatch</h1>
        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="E-Mail"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Passwort"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {isSignup && (
            <div className="flex gap-4 justify-center">
              <label className="flex items-center gap-2 cursor-pointer text-base">
                <input
                  type="radio"
                  name="role"
                  value="WORKER"
                  checked={role === "WORKER"}
                  onChange={() => setRole("WORKER")}
                  className="accent-blue-600"
                />
                <span>Arbeitnehmer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-base">
                <input
                  type="radio"
                  name="role"
                  value="EMPLOYER"
                  checked={role === "EMPLOYER"}
                  onChange={() => setRole("EMPLOYER")}
                  className="accent-blue-600"
                />
                <span>Arbeitgeber</span>
              </label>
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg py-3 font-semibold text-lg mt-2 hover:bg-blue-700 active:bg-blue-800 transition shadow-md disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Lädt..." : isSignup ? "Registrieren" : "Einloggen"}
          </button>
        </form>
        {error && <p className="text-red-600 text-center text-base mt-4 font-medium bg-red-50 rounded p-2 border border-red-200">{error}</p>}
        <div className="text-center mt-6">
          <button
            className="text-blue-700 underline text-base hover:text-blue-900 transition"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Schon registriert? Einloggen" : "Noch kein Konto? Registrieren"}
          </button>
        </div>
      </div>
    </main>
  );
}
