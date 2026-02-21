import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { sampleBooks } from "@/data/sampleBooks";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = body?.prompt || "short discussion-friendly books";
    const members = Array.isArray(body?.members) ? body.members : [];

    const memberNames = members.map((m) => m.name).filter(Boolean).join(", ");

    const instruction = `
Return EXACTLY valid JSON only.

Schema:
{
  "books": [
    {
      "title": "string",
      "author": "string",
      "pages": 250,
      "tags": ["short", "fiction"],
      "description": "1 sentence"
    }
  ]
}

Rules:
- 5 books
- discussion-friendly for a reading meetup
- realistic page counts
- short descriptions
- no markdown
- no extra text

User request: ${prompt}
Members: ${memberNames || "N/A"}
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: instruction,
    });

    const text = (response.text || "").trim();
    const cleaned = text.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.books)) throw new Error("Invalid response format");

    return NextResponse.json(parsed);
  } catch (err) {
    // fallback keeps demo safe
    return NextResponse.json({ books: sampleBooks, fallback: true });
  }
}