"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitEmail = async () => {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else window.location.href = "/profile";
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-6 text-center text-lg font-medium text-text-primary">Sign in to Knight Novel</h1>

      <button
        onClick={() => signIn("google", { callbackUrl: "/profile" })}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded border border-border bg-surface py-2.5 text-sm text-text-primary hover:border-border-hover"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-4 flex items-center gap-3 text-xs text-text-disabled">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        {error && <p className="text-xs text-status-error">{error}</p>}
        <button
          onClick={submitEmail}
          disabled={loading || !email || !password}
          className="w-full rounded bg-accent py-2.5 text-sm font-medium text-[#042C53] disabled:opacity-40"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>

      <p className="mt-5 text-center text-xs text-text-muted">
        No account? <a href="/signup" className="text-accent">Sign up</a>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.9 2.5 2.8 6.6 2.8 11.8S6.9 21 12 21c6.9 0 8.9-4.8 8.9-7.3 0-.5 0-.9-.1-1.3H12Z"/>
    </svg>
  );
}
