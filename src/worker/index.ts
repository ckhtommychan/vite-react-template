import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "IDH", projects: ["redpen.idh.asia"] }));

app.post("/api/subscribe", async (c) => {
	const body = await c.req
		.json<{ email?: string; marketingConsent?: boolean }>()
		.catch(() => null);
	const email = body?.email?.trim();

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return c.json({ ok: false, error: "invalid_email" }, 400);
	}

	if (body?.marketingConsent !== true) {
		return c.json({ ok: false, error: "consent_required" }, 400);
	}

	// Replace with your mailing list provider (Mailchimp, Klaviyo, Resend...).
	console.log(
		JSON.stringify({
			event: "marketing_consent",
			email,
			marketingConsent: true,
			source: "idh.asia",
			policyVersion: "2026-10-20",
			consentedAt: new Date().toISOString(),
		}),
	);
	return c.json({ ok: true });
});

export default app;
