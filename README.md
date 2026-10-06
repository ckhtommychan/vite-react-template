# BORHÁZ · Hungarian Wine

Landing page for a small Hungarian wine importer, built on the Cloudflare Vite + React
template. The Worker serves the built React app as static assets and handles the API
routes with Hono.

## Stack

- React 19 + TypeScript
- Vite 7 with `@cloudflare/vite-plugin`
- Hono on Cloudflare Workers
- `lucide-react` for icons

## Project layout

| Path | Purpose |
| --- | --- |
| `src/react-app/App.tsx` | Page sections, copy and interactions |
| `src/react-app/App.css`, `src/react-app/index.css` | Styles and design tokens |
| `src/worker/index.ts` | Hono API routes |
| `public/images/` | Photography (Wikimedia Commons, CC BY-SA / CC BY) |

## Getting Started

## Development

Install dependencies:

```bash
npm install
```

Start the development server with:

```bash
npm run dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

## Production

Build your project for production:

```bash
npm run build
```

Preview your build locally:

```bash
npm run preview
```

Deploy your project to Cloudflare Workers:

```bash
npm run build && npm run deploy
```

Pushing to `main` also triggers Cloudflare Workers Builds, which runs the build command
and deploys the Worker automatically.

Monitor your Worker:

```bash
npx wrangler tail
```

## API

- `GET /api/` returns a service check
- `POST /api/subscribe` accepts `{ "email": "you@example.com" }`, validates it and
  returns `{ "ok": true }`

The subscribe handler logs the address for now. Point it at your mailing list provider
before launch.
