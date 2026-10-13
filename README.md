# Podcastr

Type some text, pick a voice, get a podcast episode. Cover image generated too.

Started from the JavaScript Mastery "Podcastr" tutorial to learn Convex and Clerk, then I made it my own. The main thing I added: **ElevenLabs as a second voice provider** next to OpenAI, with the voice list pulled live from your ElevenLabs account and preview on select.

## What it does

- Generate the episode audio from text, with **OpenAI TTS** or **ElevenLabs** (`eleven_multilingual_v2`)
- Pick a voice and hear a preview before generating
- Generate a cover image from a prompt, or upload your own
- Publish, browse, search and listen with a persistent player
- Profiles, view counts, "similar podcasts" by voice

## How the voice providers work

Both providers are Convex actions that return an MP3 buffer, which is then uploaded to Convex storage.

- `convex/openai.ts`: OpenAI `tts-1` with the six built-in voices
- `convex/elevenlabs.ts`: `listVoicesAction` fetches the voices available on your ElevenLabs account, `generateAudioAction` calls the text-to-speech endpoint
- `lib/voices.ts`: ElevenLabs voices are stored as `elevenlabs:<voiceId>` in the existing `voiceType` field, so old podcasts keep working with no schema migration

## Stack

Next.js 14 (App Router), TypeScript, Convex (database, storage, actions), Clerk, Tailwind CSS, shadcn/ui, OpenAI API, ElevenLabs API.

## Run it locally

```bash
npm install
npx convex dev
```

Then set the server-side keys on your Convex deployment:

```bash
npx convex env set OPENAI_API_KEY sk-...
npx convex env set ELEVENLABS_API_KEY ...
npx convex env set CLERK_WEBHOOK_SECRET whsec_...
```

And in `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

```bash
npm run dev
```

Demo: [podcastr-lemon.vercel.app](https://podcastr-lemon.vercel.app) (the deployed version may not have the ElevenLabs provider yet)
