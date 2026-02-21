# Reading Meetup Planner

A small Next.js app for planning a reading meetup:

- Create your group
- Fetch AI-powered book recommendations
- Vote on a winning book
- Generate reading checkpoints
- Save the plan to MongoDB
- Generate a voice summary using ElevenLabs

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   GEMINI_API_KEY=...
   ELEVENLABS_API_KEY=...
   ELEVENLABS_VOICE_ID=...
   MONGODB_URI=...
   MONGODB_DB=reading_meetup_planner
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## API Routes

- `POST /api/recommend-books` – returns `{ books: [...] }` via Gemini (falls back to sample data).
- `POST /api/voice-summary` – returns `audioUrl` as base64 data URL.
- `POST /api/plans` – persists a plan in MongoDB.
- `GET /api/plans` – returns the latest saved plans.
