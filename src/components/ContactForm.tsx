"use client";

import { useState } from "react";
import { CONTACT } from "@/lib/constants";
import { CATEGORIES } from "@/lib/catalog";

const field =
  "w-full rounded-button border border-olive/30 bg-cream px-4 py-3 font-body text-espresso placeholder:text-espresso/40 focus:border-olive focus:outline-none";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Enquiry form. Posts to /api/contact (Resend handler — Prompt H). Until that is
 * wired the route returns 501, so submission falls back to a direct-email prompt.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("not ok");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-card border border-olive/20 bg-cream-deep/50 p-10 text-center">
        <p className="font-serif text-2xl text-olive-deep italic">Thank you.</p>
        <p className="mt-3 font-body text-espresso/75">
          We have received your enquiry and will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Name" className={field} />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className={field}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="phone" placeholder="Phone" className={field} />
        <select name="product" defaultValue="" className={field} required>
          <option value="" disabled>
            Product of interest
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.title}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Tell us about your temple and what you need…"
        className={field}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-button bg-olive px-8 py-3.5 font-display text-sm tracking-[0.18em] text-cream uppercase transition-colors hover:bg-olive-deep disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
      {status === "error" && (
        <p className="font-body text-sm text-oxblood">
          The enquiry service isn’t connected yet — please email us directly at{" "}
          <a href={`mailto:${CONTACT.email}`} className="underline">
            {CONTACT.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
