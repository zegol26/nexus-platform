"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidEmail, normalizeEmail } from "@/lib/email/validation";

type RegisterResponse = {
  error?: string;
  message?: string;
};

export default function RegisterPage() {
  const router = useRouter();

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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"
      >
        <p className="text-sm font-medium text-blue-600">Nexus Platform</p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Create account
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Register untuk akses Nexus Talenta Indonesia Academy.
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
              className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
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
              className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
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
              className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
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
