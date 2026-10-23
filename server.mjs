/**
 * Production Node entry for Hostinger VPS (replaces Cloudflare Workers runtime).
 * Serves the Vite client SPA + the small Hono marketing API routes.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientRoot = join(__dirname, "dist", "client");
const indexHtml = readFileSync(join(clientRoot, "index.html"), "utf8");
const port = Number(process.env.PORT || 3000);

const app = new Hono();

app.get("/api/", (c) => c.json({ name: "IDH", projects: ["redpen.idh.asia"] }));

app.post("/api/subscribe", async (c) => {
	const body = await c.req
		.json()
		.catch(() => null);
	const email = body?.email?.trim();

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return c.json({ ok: false, error: "invalid_email" }, 400);
	}

	if (body?.marketingConsent !== true) {
		return c.json({ ok: false, error: "consent_required" }, 400);
	}

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

app.use(
	"/*",
	serveStatic({
		root: clientRoot,
		rewriteRequestPath: (path) => path,
	}),
);

app.get("*", async (c) => {
	const { pathname } = new URL(c.req.url);
	const isApiRoute = pathname === "/api" || pathname.startsWith("/api/");
	const isAssetRequest = /\.[a-z0-9]+$/i.test(pathname);

	if (isApiRoute || isAssetRequest) {
		return c.notFound();
	}

	return c.html(indexHtml);
});

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
	console.log(`idh listening on http://0.0.0.0:${info.port}`);
});
