import type { Track } from '../data/types';
import { TRACK_LABEL } from '../data/types';

// A quiet label for the optional detours only. Core rows are signalled by the
// spine node, so they carry no badge; inspiration rows are signalled by the
// warm moment + spark mark. Only background/advanced get a small text label.
export function TrackBadge({ track }: { track: Track }) {
  if (track === 'core' || track === 'inspiration') return null;
  return <span className={`track-badge track-badge--${track}`}>{TRACK_LABEL[track]}</span>;
}
