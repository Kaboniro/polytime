"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginScatter from "@/components/admin/LoginScatter";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed.");
      setLoading(false);
      return;
    }
    const data = await res.json().catch(() => ({}));
    router.push(data.next || "/admin/verify");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <LoginScatter />
      <h1 className="mb-6 text-lg font-bold text-neutral-50">Admin login</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="password"
          autoFocus
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-medium px-4 py-2 text-sm transition-colors"
        >
          {loading ? "hmmm....." : "Continue"}
        </button>
      </form>
    </div>
  );
}
