"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Mail, MessageSquare } from "lucide-react";

const SUBJECTS = [
  "General enquiry",
  "Novel listing request",
  "Bug report",
  "Account issue",
  "Copyright / DMCA",
  "Partnership or business",
  "Other",
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async () => {
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("sent");
      setName("");
      setEmail("");
      setSubject(SUBJECTS[0]);
      setMessage("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong — please try again.");
      setStatus("error");
    }
  };

  const canSubmit = name.trim() && email.trim() && message.trim() && status !== "sending";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Get in touch</h1>
        <p className="mt-3 text-sm text-text-secondary">
          Have a question, suggestion, or issue? Fill in the form and we&apos;ll reply as soon as
          we can — usually within 1–2 business days.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
        {/* Form */}
        <div>
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-status-success/30 bg-status-success/10 px-8 py-12 text-center">
              <CheckCircle size={40} className="text-status-success" />
              <div>
                <p className="text-base font-semibold text-text-primary">Message sent!</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Thanks for reaching out. We&apos;ll get back to you at the email you provided.
                </p>
              </div>
              <button
                onClick={() => setStatus("idle")}
                className="mt-2 rounded-lg border border-border px-5 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                Send another message
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Name + Email row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                    Your name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="your name"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as typeof subject)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Describe your question or issue in as much detail as you can…"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
                />
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-lg border border-status-error/30 bg-status-error/10 px-3 py-2 text-xs text-status-error">
                  <AlertCircle size={13} />
                  {errorMsg}
                </div>
              )}

              <button
                onClick={submit}
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-lg bg-accent-highlight px-5 py-2.5 text-sm font-semibold text-[#412402] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={14} />
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 text-sm">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 font-medium text-text-primary">
              <Mail size={14} className="text-accent-highlight" /> Email
            </div>
            <a
              href="mailto:idenwebstudio@gmail.com"
              className="break-all text-xs text-text-secondary hover:text-text-primary"
            >
              idenwebstudio@gmail.com
            </a>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 font-medium text-text-primary">
              <MessageSquare size={14} className="text-accent-highlight" /> Response time
            </div>
            <p className="text-xs text-text-secondary">
              We typically reply within 1–2 business days. For urgent copyright issues, use our{" "}
              <a href="/dmca" className="text-accent-highlight underline underline-offset-2">
                DMCA form
              </a>
              .
            </p>
          </div>
          <p className="text-xs text-text-disabled">
            We do not offer phone support. All enquiries are handled by email.
          </p>
        </aside>
      </div>
    </div>
  );
}
