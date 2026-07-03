import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Invalid email"),
  phone: z.string().optional().default(""),
  product: z.string().optional().default(""),
  message: z.string().min(1),
});

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.CONTACT_TO_EMAIL ?? "aparamount1968@gmail.com";
const from =
  process.env.CONTACT_FROM_EMAIL ?? "Paramount Website <onboarding@resend.dev>";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please complete the required fields." },
      { status: 422 },
    );
  }

  // Env-gated: without an API key the client falls back to a direct-email prompt.
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Email service not configured." },
      { status: 501 },
    );
  }

  const { name, email, phone, product, message } = parsed.data;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Enquiry — ${product || "General"} — ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        `Product of interest: ${product || "—"}`,
        "",
        message,
      ].join("\n"),
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not send right now." },
      { status: 502 },
    );
  }
}
