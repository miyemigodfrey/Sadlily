export type VocalType = "female" | "male" | "duet" | "instrumental";

export interface GenerationOptions {
  prompt: string;
  title?: string;
  genres: string[];
  mood: string;
  tempo: string;
  vocal: VocalType;
  instrumental: boolean;
}

export interface Song extends GenerationOptions {
  id: string;
  title: string;
  lyrics: string;
  audioUrl: string;
  coverHue: number;
  durationLabel: string;
  createdAt: number;
}
