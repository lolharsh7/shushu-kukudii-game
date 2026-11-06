# Shushu vs Kukudii — Love War Arena

A cartoon-style, landscape-first 2D browser fighting game for two players.

## Free stack
- **Vercel Hobby**: hosts the static Vite/React website.
- **Supabase Free**: Realtime broadcast and presence for private-by-code rooms.
- **CSS emoji characters and animations**: no paid images, game engine, or asset subscription.
- No paid API, no credit card requirement from this code, and no database table required.

Free services have quotas and policies that can change. This is designed for a tiny two-player personal game, not unlimited public traffic.

## A. Supabase project is preconfigured
The supplied Supabase Project URL and anon/public key are already written to `.env.production` for Vercel production builds. The anon key is intended for browser use; never put a `service_role` or secret key in this project.

If you fork or change the Supabase project, replace the values in `.env.production` or set the same variables in Vercel Project Settings → Environment Variables.

1. Open https://supabase.com and check your project is active.
2. In the project, go to **Project Settings → API**.
3. Copy the **Project URL** and the **anon/public key** (not the service-role key).
4. Realtime is used through Supabase channels. If project settings have Realtime channel restrictions, allow the app's channel use for your project.
5. This app does not need SQL tables or Edge Functions.

## B. Run on your computer
Install Node.js LTS, then:
```bash
npm install
cp .env.example .env.local
```
Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```
Then:
```bash
npm run dev
```

## C. Deploy free on Vercel
1. Upload this folder to a GitHub repository.
2. Go to https://vercel.com/new and import that repository.
3. Framework preset: **Vite**; build command `npm run build`; output directory `dist`.
4. Add the same two environment variables in Vercel → Project → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Share the `*.vercel.app` link with your partner.
6. If you change environment variables later, redeploy.

## D. Play together
1. You tap **Create Room**. You are SHUSHU. Copy the five-character room code.
2. Send your Vercel link and room code to your partner.
3. Your partner enters the code and taps **Join**. The guest role is KUKUDII.
4. Either player can press Start Fight.
5. Use landscape orientation. The page has a landscape layout and rotates the match UI on supported portrait mobile browsers.

## Controls
- Left / right arrows: move
- Punch: 9 damage
- Kick: 13 damage
- Block: reduces incoming hit damage
- Special: 25 damage; requires 35 energy
- Normal attacks build energy

## Prototype limitations (honest notes)
- This is a lightweight casual prototype. Supabase Realtime sends player events; it is not a server-authoritative fighting-game simulation. A player can manipulate their browser, and simultaneous attacks or weak network conditions can cause state drift.
- The room code is a convenience, not a password. Anyone with the code and public site link may try to join.
- Realtime free-tier quotas and Vercel free-tier eligibility/limits are controlled by those providers and may change. The app itself has no paid dependencies.
- Use the same deployed version on both phones. For best results, keep the game tab open and use a stable internet connection.
