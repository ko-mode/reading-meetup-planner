import { NextResponse } from "next/server";

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

    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    });

    if (!elevenRes.ok) {
      const errorText = await elevenRes.text();
      return NextResponse.json({ error: `ElevenLabs failed: ${errorText}` }, { status: 500 });
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    return NextResponse.json({ audioUrl });
  } catch (err) {
    return NextResponse.json({ error: "Voice summary failed" }, { status: 500 });
  }
}