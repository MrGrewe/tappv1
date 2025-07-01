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
        const { data, error: signUpError } = await supabase.auth.signUp({
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-100 to-white">
      <div className="w-full max-w-xs bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">JobMatch</h1>
        <form onSubmit={handleAuth} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-Mail"
            className="input input-bordered w-full rounded px-3 py-2 border"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Passwort"
            className="input input-bordered w-full rounded px-3 py-2 border"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {isSignup && (
            <div className="flex gap-2 justify-center">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="WORKER"
                  checked={role === "WORKER"}
                  onChange={() => setRole("WORKER")}
                />
                <span className="ml-1">Arbeitnehmer</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="EMPLOYER"
                  checked={role === "EMPLOYER"}
                  onChange={() => setRole("EMPLOYER")}
                />
                <span className="ml-1">Arbeitgeber</span>
              </label>
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded py-2 font-semibold mt-2 hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Lädt..." : isSignup ? "Registrieren" : "Einloggen"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="text-center mt-4">
          <button
            className="text-blue-600 underline text-sm"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Schon registriert? Einloggen" : "Noch kein Konto? Registrieren"}
          </button>
        </div>
      </div>
    </main>
  );
}
