"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CONTACT } from "@/lib/constants";
import { CATEGORIES } from "@/lib/catalog";

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email"),
  phone: z.string().optional(),
  product: z.string().min(1, "Select a product"),
  message: z.string().min(1, "Tell us a little"),
});
type Values = z.infer<typeof schema>;

const field =
  "w-full rounded-button border border-olive/30 bg-cream px-4 py-3 font-body text-espresso placeholder:text-espresso/40 focus:border-olive focus:outline-none";
const errCls = "mt-1 font-body text-xs text-oxblood";

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
        <p className="font-serif text-2xl text-olive-deep italic">Thank you.</p>
        <p className="mt-3 font-body text-espresso/75">
          We have received your enquiry and will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input {...register("name")} placeholder="Name" className={field} />
          {errors.name && <p className={errCls}>{errors.name.message}</p>}
        </div>
        <div>
          <input {...register("email")} placeholder="Email" className={field} />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input {...register("phone")} placeholder="Phone (optional)" className={field} />
        <div>
          <select {...register("product")} defaultValue="" className={field}>
            <option value="" disabled>
              Product of interest
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
          {errors.product && <p className={errCls}>{errors.product.message}</p>}
        </div>
      </div>
      <div>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Tell us about your temple and what you need…"
          className={field}
        />
        {errors.message && <p className={errCls}>{errors.message.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-button bg-olive px-8 py-3.5 font-display text-sm tracking-[0.18em] text-cream uppercase transition-colors hover:bg-olive-deep disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Send enquiry"}
      </button>
      {failed && (
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
