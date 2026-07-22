# Isaipadam

> A unified video + audio streaming prototype — one platform that merges the best of YouTube and YouTube Music, with seamless switching between Video and Audio modes.

Built as a working demo of the "unified streaming platform" concept — the same core idea explored in the [YouTube Unified Platform Strategy](https://ashokkumarone.github.io) case study, brought to life as an actual product.

---

## What It Does

- **Video / Audio mode toggle** — the same content library reflows into a full video player or a dedicated audio-player UI with synced lyrics, without leaving the app
- **YouTube-style navigation** — Home, Library/Playlist, History, Liked, Downloads, Settings, driven by a persistent sidebar
- **Curated content library** — tracks and videos with metadata (views, likes, channel, subscribers, comments) and custom playlists
- **Synced lyrics view** for music tracks, timestamped line by line
- **Live "Active Audience" mode** — for live streams (e.g. a live cricket match), viewers get real-time polling, reaction counters, and a simulated live chat feed running alongside the stream
- **Dark mode**, sign-in state, and a premium-tier toggle to demo monetization surfaces

---

## Why This Exists

Most streaming apps force a choice: a video app for shows and sports, a separate app for music. Isaipadam prototypes what a single, unified player experience could look like — one interface, one library, one identity, switching seamlessly between video and audio, with shared engagement features (live chat, reactions, polls) across both.

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** for build tooling, **Tailwind CSS 4** for styling
- **lucide-react** for icons, **motion** for animation
- **@google/genai** (Gemini API) for AI-assisted features
- Built and prototyped using **Google AI Studio**

---

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

---

## Author

**Ashok Kumar S**
[linkedin.com/in/ashokkumarone](https://linkedin.com/in/ashokkumarone) · [github.com/ashokkumarone](https://github.com/ashokkumarone) · [Portfolio](https://ashokkumarone.github.io)
