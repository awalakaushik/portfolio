export type EmojiCue = 'thumbsup' | 'handshake' | 'lightbulb' | 'briefcase' | 'sparkle';
export interface VoicePayload { emojiType: EmojiCue | null; spokenText: string }

export function parseVoiceResponse(raw: string): VoicePayload {
  const match = raw.match(/\[EMOJI:(thumbsup|handshake|lightbulb|briefcase|sparkle)\]/i);
  const spokenText = raw
    .replace(/\[EMOJI:[^\]]*\]/gi, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/C\s*sharp|C\s*#/gi, 'C-sharp')
    .replace(/Q\s*#/gi, 'Q-sharp')
    .replace(/\.NET\s*Core/gi, 'dot NET Core')
    .replace(/\.NET/gi, 'dot NET')
    .replace(/D3(?:\.js)?/gi, 'D-three dot js')
    .replace(/\b(Node|Vue|React)\.js\b/gi, '$1 dot js')
    .replace(/\bML\.NET\b/gi, 'M L dot NET')
    .replace(/\bAWS\b/g, 'A W S')
    .replace(/\bSQL\b/g, 'S Q L')
    .replace(/\bAPI\b/g, 'A P I')
    .replace(/\bHIPAA\b/g, 'H I P A A')
    .replace(/\bSEFH\b/g, 'S E F H')
    .replace(/[*_`#]/g, '')
    .replace(/\s+/g, ' ').trim();
  return { emojiType: match ? match[1].toLowerCase() as EmojiCue : null, spokenText };
}

// Complete turns only. Parsing partial stream chunks could leak split tags.
export async function handleModelStream(rawText: string,
  emojiEmitter: { spawn: (type: EmojiCue, x: number, y: number) => void },
  ttsEngine: { speak: (text: string) => Promise<void> },
  hudCoords: { x: number; y: number }) {
  const payload = parseVoiceResponse(rawText);
  if (payload.emojiType) emojiEmitter.spawn(payload.emojiType, hudCoords.x, hudCoords.y);
  if (payload.spokenText) await ttsEngine.speak(payload.spokenText);
}
