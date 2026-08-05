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
  "w-full rounded-xl border border-gold/40 bg-cream/15 px-4 py-3.5 font-body text-cream transition-all placeholder:text-cream/50 hover:border-gold focus:border-gold focus:bg-cream/25 focus:outline-none focus:ring-1 focus:ring-gold";
const errCls = "mt-1.5 pm-small font-body text-gold/90 font-medium";
const labelCls = "pm-label mb-2 block font-display text-gold tracking-[0.16em]";

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
      <div className="rounded-2xl border border-gold/40 bg-cream/15 p-10 text-center">
        <p className="pm-h3 font-display text-gold">Thank you.</p>
        <p className="mt-3 pm-body font-body text-cream">
          We have received your enquiry and will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Your Name</span>
          <input {...register("name")} placeholder="Your full name" className={field} />
          {errors.name && <p className={errCls}>{errors.name.message}</p>}
        </label>
        <label className="block">
          <span className={labelCls}>Email Address</span>
          <input {...register("email")} placeholder="you@example.com" className={field} />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </label>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Phone Number</span>
          <input {...register("phone")} placeholder="Optional (+91…)" className={field} />
        </label>
        <label className="block">
          <span className={labelCls}>Product of interest</span>
          <select
            {...register("product")}
            defaultValue=""
            className={`${field} bg-[#6E643B] text-cream [&>option]:bg-[#6E643B] [&>option]:text-cream`}
          >
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
          placeholder="Tell us about your temple requirements, dimensions, or custom specifications…"
          className={field}
        />
        {errors.message && <p className={errCls}>{errors.message.message}</p>}
      </label>
      <div className="pt-3">
        <Button type="submit" variant="cream" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Sending enquiry…" : "Send enquiry"}
        </Button>
      </div>
      {failed && (
        <p className="pm-small font-body text-gold/90">
          The enquiry service isn’t connected yet, please email us directly at{" "}
          <a href={`mailto:${CONTACT.email}`} className="underline text-cream font-medium">
            {CONTACT.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
