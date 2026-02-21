import { NextResponse } from "next/server";
import { sampleBooks } from "@/data/sampleBooks";
import { recommendBooksWithGemini } from "@/lib/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = body?.prompt || "short discussion-friendly books";
    const members = Array.isArray(body?.members) ? body.members : [];

    const parsed = await recommendBooksWithGemini({ prompt, members });
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ books: sampleBooks, fallback: true });
  }
}
