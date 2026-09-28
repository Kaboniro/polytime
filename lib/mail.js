import nodemailer from "nodemailer";

// Sends the admin sign-in code. Providers, in order of preference:
//
//   1. SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS, ...) — e.g. Gmail. For a Gmail
//      address use smtp.gmail.com, port 465 and an "app password" (Google
//      Account > Security > 2-Step Verification > App passwords); your normal
//      Gmail password will not work.
//   2. EmailJS (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY,
//      optionally EMAILJS_PRIVATE_KEY) — a hosted service, see README.
//   3. Nothing configured: development prints the code in the server console
//      so you can still sign in; production refuses (login fails closed rather
//      than silently skipping the second step).
export const smtpConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
export const emailJsConfigured = () => Boolean(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY);
export const mailConfigured = () => smtpConfigured() || emailJsConfigured();

export function adminEmail() {
  return (process.env.ADMIN_EMAIL || "").trim() || null;
}

async function viaSmtp(to, pretty, minutes) {
  const port = Number(process.env.SMTP_PORT) || 465;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE !== "false" : port === 465,
    // Google shows app passwords in groups of four with spaces; they're not part of the password.
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS.replace(/\s+/g, "") },
    connectionTimeout: 15000,
    socketTimeout: 20000,
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM || `PolyTime Admin <${process.env.SMTP_USER}>`,
    to,
    subject: `PolyTime admin sign-in code: ${pretty}`,
    text: `Your PolyTime admin sign-in code is ${pretty}\n\nIt works once and expires in ${minutes} minutes.\n\nIf you didn't just enter your admin password, someone else knows it: change ADMIN_PASSWORD and ADMIN_SECRET.`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:420px"><p>Your PolyTime admin sign-in code:</p><p style="font-size:30px;letter-spacing:6px;font-weight:700;font-family:monospace">${pretty}</p><p>It works once and expires in ${minutes} minutes.</p><p style="color:#666;font-size:13px">If you didn't just enter your admin password, someone else knows it. Change <code>ADMIN_PASSWORD</code> and <code>ADMIN_SECRET</code>.</p></div>`,
  });
}

async function viaEmailJs(to, pretty, minutes) {
  const res = await fetch(process.env.EMAILJS_API_URL || "https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      ...(process.env.EMAILJS_PRIVATE_KEY ? { accessToken: process.env.EMAILJS_PRIVATE_KEY } : {}),
      template_params: { to_email: to, code: pretty, expires_in: String(minutes), subject: `PolyTime admin sign-in code: ${pretty}` },
    }),
  });
  if (!res.ok) {
    const body = (await res.text().catch(() => "")).slice(0, 200);
    throw new Error(`EmailJS answered ${res.status}${body ? `: ${body}` : ""}`);
  }
}

export async function sendAdminCode(code, minutes) {
  const to = adminEmail();
  if (!to) throw new Error("ADMIN_EMAIL is not set. Add it to .env.local so the sign-in code has somewhere to go.");
  const pretty = `${code.slice(0, 4)}-${code.slice(4)}`;

  if (smtpConfigured()) {
    await viaSmtp(to, pretty, minutes);
    return { sent: true, dev: false };
  }
  if (emailJsConfigured()) {
    await viaEmailJs(to, pretty, minutes);
    return { sent: true, dev: false };
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("No email provider is configured (SMTP_* or EMAILJS_*), so the sign-in code can't be sent.");
  }
  console.log(`\n[admin login] No email provider is configured, so here is the code for ${to}: ${pretty}\n`);
  return { sent: false, dev: true };
}
