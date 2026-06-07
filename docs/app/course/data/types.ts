// Domain model for the standalone /course curriculum.
// Kept dependency-free so it can be imported by UI, scripts, and tooling alike.

/** Required spine, optional detours, and wonder/motivation pieces. */
export type Track = 'core' | 'background' | 'advanced' | 'inspiration';

/** The kind of resource, drives the thumbnail fallback motif and the type label. */
export type ResourceType =
  | 'video'
  | 'article'
  | 'book'
  | 'paper'
  | 'course'
  | 'interactive';

export interface Resource {
  /** Stable slug. Used as the localStorage progress key, so it must never change. */
  id: string;
  title: string;
  type: ResourceType;
  /** Author or publishing source, e.g. "3Blue1Brown", "Anthropic". */
  author: string;
  /** Canonical, verified external URL. */
  url: string;
  /** Human-readable length, e.g. "18 min", "~370 pp", "6-week course". */
  duration?: string;
  track: Track;
  /** One sentence: what you get from it. */
  why: string;
  /**
   * Local path to a generated thumbnail, e.g. "/course/thumbs/<id>.jpg".
   * When absent or the image fails to load, the UI renders a designed CSS cover.
   */
  thumbnail?: string;
  /** Optional average color of the thumbnail (oklch or hex) for tinting the cover fallback. */
  thumbColor?: string;
}

export interface Chapter {
  id: string;
  /** Display number, e.g. "00" for the optional prelude, "01"+ for the core path. Falls back to index. */
  number?: string;
  title: string;
  summary: string;
  /** A whole chapter that is optional/skippable (e.g. the "00" foundations prelude). */
  optional?: boolean;
  items: Resource[];
}

export interface Curriculum {
  title: string;
  subtitle: string;
  chapters: Chapter[];
}

export const TRACK_LABEL: Record<Track, string> = {
  core: 'core',
  background: 'background',
  advanced: 'advanced',
  inspiration: 'inspiration',
};

export const TYPE_LABEL: Record<ResourceType, string> = {
  video: 'video',
  article: 'article',
  book: 'book',
  paper: 'paper',
  course: 'course',
  interactive: 'interactive',
};
