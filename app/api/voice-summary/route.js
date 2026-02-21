import { NextResponse } from "next/server";
import { textToSpeech } from "@/lib/elevenlabs";

export async function POST(req) {
  try {
    const body = await req.json();
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey || !voiceId) {
      return NextResponse.json({ error: "Missing ElevenLabs env vars" }, { status: 400 });
    }

    const text = [
      `Your reading meetup plan is ready for ${body.groupName || "your group"}.`,
      `You chose ${body.book?.title || "a book"} by ${body.book?.author || "an author"}.`,
      `Your meetup is on ${body.meetupDate} at ${body.meetupTime}.`,
      body.locationSuggestion ? `Location suggestion: ${body.locationSuggestion}.` : "",
      body.nextCheckpoint
        ? `Your first checkpoint is pages ${body.nextCheckpoint.startPage} to ${body.nextCheckpoint.endPage} by ${body.nextCheckpoint.date}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const base64 = await textToSpeech({ text, voiceId, apiKey });
    return NextResponse.json({ audioUrl: `data:audio/mpeg;base64,${base64}` });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Voice summary failed" }, { status: 500 });
  }
}
