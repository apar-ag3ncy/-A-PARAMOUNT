"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CONTACT } from "@/lib/constants";
import { CATEGORIES } from "@/lib/catalog";
import Button from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email"),
  phone: z.string().optional(),
  product: z.string().min(1, "Select a product"),
  message: z.string().min(1, "Tell us a little"),
});
type Values = z.infer<typeof schema>;

const field =
  "w-full rounded-xl border border-olive/30 bg-cream px-4 py-3.5 font-body text-espresso transition-colors placeholder:text-espresso/40 focus:border-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
const errCls = "mt-1 pm-small font-body text-[color:var(--color-heading-brown)]";
const labelCls = "pm-label mb-1.5 block font-body text-olive/80";

/**
 * Enquiry form (build-plan Prompt H). react-hook-form + zod validation, posts to
 * /api/contact (Resend). Until RESEND_API_KEY is set the route returns 501 and we
 * fall back to a direct-email prompt.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setFailed(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("not ok");
      reset();
      setSent(true);
    } catch {
      setFailed(true);
    }
  }

  if (sent) {
    return (
      <div className="rounded-card border border-olive/20 bg-cream-deep/50 p-10 text-center">
        <p className="pm-h3 font-body text-olive-deep italic">Thank you.</p>
        <p className="mt-3 pm-body font-body text-espresso/75">
          We have received your enquiry and will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Name</span>
          <input {...register("name")} placeholder="Your name" className={field} />
          {errors.name && <p className={errCls}>{errors.name.message}</p>}
        </label>
        <label className="block">
          <span className={labelCls}>Email</span>
          <input {...register("email")} placeholder="you@example.com" className={field} />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Phone</span>
          <input {...register("phone")} placeholder="Optional" className={field} />
        </label>
        <label className="block">
          <span className={labelCls}>Product of interest</span>
          <select {...register("product")} defaultValue="" className={field}>
            <option value="" disabled>
              Select a piece…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
          {errors.product && <p className={errCls}>{errors.product.message}</p>}
        </label>
      </div>
      <label className="block">
        <span className={labelCls}>Your message</span>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Tell us about your temple and what you need…"
          className={field}
        />
        {errors.message && <p className={errCls}>{errors.message.message}</p>}
      </label>
      <div className="pt-2">
        <Button type="submit" variant="solid" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send enquiry"}
        </Button>
      </div>
      {failed && (
        <p className="pm-small font-body text-[color:var(--color-heading-brown)]">
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
