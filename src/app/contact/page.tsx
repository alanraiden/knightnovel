"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-xl font-medium text-text-primary">Contact</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Have a question or issue? Send us a message and we'll get back to you.
      </p>

      {status === "sent" ? (
        <p className="mt-6 text-sm text-status-success">Thanks — your message has been sent.</p>
      ) : (
        <div className="mt-6 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full rounded border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Your message"
            className="w-full rounded border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted"
          />
          {status === "error" && (
            <p className="text-xs text-status-error">Something went wrong — please try again.</p>
          )}
          <button
            onClick={submit}
            disabled={!name || !email || !message || status === "sending"}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-[#042C53] disabled:opacity-40"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
        </div>
      )}
    </div>
  );
}
