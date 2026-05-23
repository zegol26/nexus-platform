"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { nexusLogoUrl } from "@/lib/nexus/marketing";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    const callbackUrl =
    new URLSearchParams(window.location.search).get("callbackUrl");

    router.push(callbackUrl || "/platform/dashboard");
    router.refresh();
    }

  return (
    <main className="nexus-market-shell grid min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="min-w-0">
          <Image
            src={nexusLogoUrl}
            alt="Nexus Talenta Indonesia"
            width={240}
            height={72}
            className="h-16 w-auto"
            priority
          />
          <h1 className="mt-8 max-w-2xl text-5xl font-black leading-tight text-slate-950">
            Login ke ruang belajar Nexus Talenta Indonesia Academy.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Lanjutkan modul, lihat progress, gunakan promo aktif, dan akses fitur
            belajar adaptif dari satu dashboard.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["AI Chat", "AI Talk", "Adaptive Learning", "Massive Mock Test"].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-4 text-sm font-black text-blue-800 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="nexus-glass rounded-[28px] p-6">
          <form onSubmit={handleLogin} className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-extrabold text-blue-700">Member area</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Masuk platform</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gunakan akun Nexus Platform yang sudah terdaftar.
            </p>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-extrabold text-slate-700">
                Email
                <span className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    className="nexus-field pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    type="email"
                    required
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-extrabold text-slate-700">
                Password
                <span className="relative">
                  <LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    className="nexus-field pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    type="password"
                    required
                  />
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="nexus-primary mt-6 w-full disabled:opacity-50">
              {loading ? "Signing in..." : "Login"} <ArrowRight size={18} />
            </button>

            <p className="mt-4 text-center text-sm text-slate-600">
              Belum punya akun?{" "}
              <a className="font-extrabold text-blue-700" href="/register">
                Register
              </a>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
