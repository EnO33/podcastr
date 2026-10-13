export type VoiceProvider = "openai" | "elevenlabs";

export const openAIVoices = ["alloy", "shimmer", "nova", "echo", "fable", "onyx"];

const ELEVENLABS_PREFIX = "elevenlabs:";

// voiceType is stored as "alloy" for OpenAI voices and "elevenlabs:<voiceId>" for ElevenLabs ones,
// so existing podcasts keep working without a schema change.
export const toVoiceType = (provider: VoiceProvider, voiceId: string) =>
  provider === "elevenlabs" ? `${ELEVENLABS_PREFIX}${voiceId}` : voiceId;

export const parseVoiceType = (
  voiceType: string
): { provider: VoiceProvider; voiceId: string } =>
  voiceType.startsWith(ELEVENLABS_PREFIX)
    ? { provider: "elevenlabs", voiceId: voiceType.slice(ELEVENLABS_PREFIX.length) }
    : { provider: "openai", voiceId: voiceType };
