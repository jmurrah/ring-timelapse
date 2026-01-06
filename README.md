# ring-timelapse

Next.js app for managing the Ring timelapse token workflow. The existing Ring
client now runs from a Node runtime inside Next.js, with a simple UI to start
the client and persist refresh token updates into `.env`.

## Getting started

1. Install dependencies: `npm install`
2. Add `RING_REFRESH_TOKEN` to `.env`
3. Start the app: `npm run dev`
4. Open http://localhost:3000 and use the Ring token card to start the client.

## Key pieces

- `app/api/ring/route.ts` starts the Ring client and reports env status.
- `lib/ring/setup.ts` creates a singleton `RingApi` instance on the server.
- `lib/ring/tokenRefresh.ts` listens for refresh token updates and writes them
  back to `.env`.
- `components/RingSetupCard.tsx` is the interactive card on the homepage.
