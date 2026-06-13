"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUiText } from "@/components/i18n/dictionary";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { isValidEmail, normalizeEmail } from "@/lib/email/validation";

type RegisterResponse = {
  error?: string;
  message?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      setError("Masukkan email yang valid.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: normalizedEmail,
          password,
        }),
      });

      const data = (await res.json()) as RegisterResponse;

      if (!res.ok) {
        setError(data.error ?? "Register failed");
        return;
      }

      setSuccess(data.message ?? "Registrasi berhasil. Silakan cek email kamu.");
      window.setTimeout(() => {
        router.push("/login");
      }, 1400);
    } catch {
      setError("Registrasi belum bisa diproses. Coba lagi sebentar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="nexus-market-shell relative grid min-h-screen place-items-center px-4 py-10 sm:px-6">
      <div className="absolute right-4 top-4 sm:right-6">
        <LanguageToggle />
      </div>
      <form
        onSubmit={handleRegister}
        className="nexus-card w-full max-w-md rounded-2xl bg-white p-5 shadow-sm sm:p-8"
      >
        <p className="text-sm font-medium text-blue-600">Nexus Platform</p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {getUiText("auth.createAccount", language)}
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          {getUiText("auth.registerCopy", language)}
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              className="nexus-field mt-1 text-sm"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              className="nexus-field mt-1 text-sm"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              className="nexus-field mt-1 text-sm"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 6 characters"
              type="password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a className="font-medium text-blue-600" href="/login">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}
