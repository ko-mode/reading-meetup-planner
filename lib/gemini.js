import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export function getGeminiClient() {
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  return new GoogleGenAI({ apiKey });
}

export async function recommendBooksWithGemini({ prompt, members = [] }) {
  const ai = getGeminiClient();
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

User request: ${prompt || "short discussion-friendly books"}
Members: ${memberNames || "N/A"}
`.trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: instruction,
  });

  const text = (response.text || "").trim();
  const cleaned = text.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed.books)) {
    throw new Error("Invalid Gemini response format");
  }

  return parsed;
}
