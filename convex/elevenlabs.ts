import { action } from "./_generated/server";
import { v } from "convex/values";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";

const getApiKey = () => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }
  return apiKey;
};

type ElevenLabsVoice = {
  voice_id: string;
  name: string;
  preview_url: string | null;
  category: string;
};

export const listVoicesAction = action({
  args: {},
  handler: async () => {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: { "xi-api-key": getApiKey() },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs voices request failed: ${response.status}`);
    }

    const { voices } = (await response.json()) as { voices: ElevenLabsVoice[] };

    return voices
      .map((voice) => ({
        id: voice.voice_id,
        name: voice.name,
        previewUrl: voice.preview_url,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const generateAudioAction = action({
  args: {
    input: v.string(),
    voice: v.string(),
  },
  handler: async (_, { voice, input }) => {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": getApiKey(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input,
          model_id: ELEVENLABS_MODEL_ID,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS request failed: ${response.status}`);
    }

    return await response.arrayBuffer();
  },
});
