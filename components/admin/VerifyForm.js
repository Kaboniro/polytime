"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FunnyFace, { WRONG_MOODS } from "@/components/admin/FunnyFaces";
import LoginScatter from "@/components/admin/LoginScatter";

// Lines for each wrong guess, in order (it cycles if there are ever more).
// Mean only to the person typing, and only mildly.
const WRONG = [
  "Nope. That is not the code. Bold guess, though.",
  "Wrong again. The code has been hiding from you all day.",
  "Are you typing with oven mitts on?",
  "Even a router that still says \"admin / admin\" would be embarrassed for you.",
  "Five thousand years of civilisation and this is what we get.",
  "At this point the code is just avoiding eye contact.",
];
// Headline quips while you stare at the code box; they rotate on their own.
const QUIPS = [
  "hmmm.....",
  "Take your time. We have all night. Literally.",
  "The code is somewhere. Probably.",
  "No pressure. Okay, a little pressure.",
  "Psst. It is not 12345678.",
  "Loading personality... done.",
  "You have the look of someone who knows the code.",
];
const LOCKED = "That's the limit. The code has been escorted out of the building. Go back and start over with your password.";
const EXPIRED = "That code expired. Like milk, but sadder. Ask for a fresh one.";
const HAPPY = "Access granted. Try not to break anything.";

export default function VerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [mood, setMood] = useState("waiting");
  const [message, setMessage] = useState(null); // { text, tone }
  const [left, setLeft] = useState(null);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);
  const [cooldown, setCooldown] = useState(30);
  const input = useRef(null);
  const [quip, setQuip] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQuip((q) => (q + 1) % QUIPS.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(e) {
    e.preventDefault();
    if (!code.trim() || busy || locked) return;
    setBusy(true);
    let res;
    try {
      res = await fetch("/api/admin/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    } catch {
      setBusy(false);
      setMessage({ text: "Couldn't reach the server. Try again in a moment.", tone: "error" });
      return;
    }
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setMood("happy");
      setMessage({ text: HAPPY, tone: "ok" });
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 900);
      return;
    }
    setBusy(false);
    if (data.error === "missing") return router.push("/admin/login");
    if (res.status === 429) return setMessage({ text: data.error || "Slow down.", tone: "error" });

    setShake((n) => n + 1);
    if (data.error === "wrong") {
      const n = data.attempt || 1;
      setMood(WRONG_MOODS[(n - 1) % WRONG_MOODS.length]);
      setMessage({ text: WRONG[(n - 1) % WRONG.length], tone: "wrong" });
      setLeft(data.attemptsLeft);
      setCode("");
      input.current?.focus();
    } else if (data.error === "locked") {
      setMood("knockedout");
      setMessage({ text: LOCKED, tone: "wrong" });
      setLeft(0);
      setLocked(true);
    } else if (data.error === "expired") {
      setMood("sleepy");
      setMessage({ text: EXPIRED, tone: "wrong" });
      setCode("");
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    const res = await fetch("/api/admin/verify/resend", { method: "POST" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      setMood("waiting");
      setLocked(false);
      setLeft(null);
      setMessage({ text: "A new code is on its way. The old one no longer works.", tone: "info" });
      setCooldown(30);
      setCode("");
      input.current?.focus();
    } else if (data.error === "wait") {
      setCooldown(Math.ceil((data.retryInMs || 30000) / 1000));
    } else if (data.error === "limit") {
      setMood("knockedout");
      setLocked(true);
      setMessage({ text: "No more codes for this login. Go back and start over with your password.", tone: "wrong" });
    } else if (data.error === "missing") {
      router.push("/admin/login");
    } else {
      setMessage({ text: "Couldn't send another email. Check the mail settings on the server.", tone: "error" });
    }
  }

  const tone = { wrong: "text-red-400", error: "text-red-400", ok: "text-emerald-400", info: "text-neutral-300" };

  return (
    <div className="mx-auto mt-6 max-w-sm text-center">
      <div key={shake} className={`inline-block ${shake ? "animate-[pt-shake_500ms_ease-in-out] motion-reduce:animate-none" : ""}`}>
        <FunnyFace mood={mood} size={132} />
      </div>
      <LoginScatter />
      <h1 className="mt-3 min-h-[3.5rem] text-lg font-bold text-neutral-50" aria-live="off">
        {QUIPS[quip]}
      </h1>

      <form onSubmit={submit} className="mt-4 space-y-3 text-left">
        <label className="sr-only" htmlFor="code">Sign-in code</label>
        <input
          id="code"
          ref={input}
          autoFocus
          autoComplete="one-time-code"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={locked || busy}
          maxLength={12}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 text-center font-mono text-xl tracking-[0.3em] text-neutral-100 placeholder:tracking-widest placeholder:text-neutral-600 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
        />
        <div aria-live="polite" className="min-h-[3.25rem] text-center text-sm">
          {message && <p className={tone[message.tone]}>{message.text}</p>}
          {left != null && !locked && message?.tone === "wrong" && (
            <p className="mt-1 text-xs text-neutral-500">
              {left} {left === 1 ? "try" : "tries"} left on this code
            </p>
          )}
        </div>
        <button
          disabled={busy || locked || !code.trim()}
          className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-orange-400 disabled:opacity-50"
        >
          {busy ? "hmmm....." : "Open the admin panel"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
        <button type="button" onClick={resend} disabled={cooldown > 0} className="underline hover:text-neutral-200 disabled:no-underline disabled:opacity-60">
          {cooldown > 0 ? `hmmm..... ${cooldown}s` : "Send me a new code"}
        </button>
        <a href="/admin/login" className="underline hover:text-neutral-200">
          Start over
        </a>
      </div>
    </div>
  );
}
