import { curriculum } from './curriculum';
import type { Curriculum } from './types';
import thumbsRaw from './thumbnails.json';

// thumbnails.json is filled concurrently by a script with entries like
// { "<id>": { "thumbnail": "/course/thumbs/<id>.jpg", "thumbColor"?: "..." } }.
// Type it loosely so an empty {} and a populated map both satisfy the import.
const thumbs = thumbsRaw as Record<
  string,
  { thumbnail?: string; thumbColor?: string }
>;

/**
 * Returns the curriculum with any available thumbnail / thumbColor merged onto
 * each resource by id. Pure: produces a fresh object, never mutates the source.
 */
export function getCurriculum(): Curriculum {
  return {
    ...curriculum,
    chapters: curriculum.chapters.map((chapter) => ({
      ...chapter,
      items: chapter.items.map((item) => {
        const extra = thumbs[item.id];
        if (!extra) return item;
        return {
          ...item,
          thumbnail: extra.thumbnail ?? item.thumbnail,
          thumbColor: extra.thumbColor ?? item.thumbColor,
        };
      }),
    })),
  };
}
