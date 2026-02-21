const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

export async function textToSpeech({ text, voiceId, apiKey, modelId = "eleven_multilingual_v2" }) {
  if (!apiKey || !voiceId) {
    throw new Error("Missing ElevenLabs credentials");
  }

  const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, model_id: modelId }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`ElevenLabs failed: ${details}`);
  }

  const audioBuffer = await response.arrayBuffer();
  return Buffer.from(audioBuffer).toString("base64");
}
