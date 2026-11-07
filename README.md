# Shushu vs Kukudii — Cartoon Fighting Game v2

This version uses custom full-body SVG cartoon fighters with heads, faces, torsos, arms, hands, legs, boots, capes and CSS attack animations. No emoji are used as the fighters.

## Free stack
- Vercel Hobby static hosting
- Supabase Free Realtime presence/broadcast
- React + Vite + hand-authored SVG/CSS characters
- No paid game engine or image API

Free service quotas and terms can change. This is a casual private two-player prototype, not an unlimited public game.

## Supabase setup
Use your existing project. Copy Project URL and anon/public key from Supabase → Project Settings → API. Do not use service_role/secret keys.

Create `.env.local` in the root:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```
Then run `npm install` and `npm run dev`.

## GitHub and Vercel
Upload the contents of this folder to a GitHub repository, preserving `src/` and its files. Do not upload `.env.local`.

Import the repo at https://vercel.com/new:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `./`

Add Vercel environment variables:
- `VITE_SUPABASE_URL` = your Project URL
- `VITE_SUPABASE_ANON_KEY` = your anon/public key

Deploy. Shushu creates a room; Kukudii joins with the room code.

## Controls
Left/right move, Punch (10 damage), Kick (14), Block (reduces incoming damage), Special (25 damage, costs 35 energy). Punch/kick build energy.

## Prototype caveats
Game actions are broadcast from browsers, not validated by a dedicated authoritative game server. Latency and simultaneous actions can cause state drift. Anyone who has the room code may attempt to join. Keep the room code private.
