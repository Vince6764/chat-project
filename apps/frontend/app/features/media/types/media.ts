export type MediaKind = "IMAGE" | "VIDEO" | "AUDIO" | "FILE";

export interface MediaItem {
  id: string;
  url: string;
  kind: MediaKind;
  storageKey?: string;
  bytes?: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}
