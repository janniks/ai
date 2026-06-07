import type { Track } from '../data/types';
import { TRACK_LABEL } from '../data/types';

// Small, quiet mono badge. core = solid ink, background = muted blue-gray,
// advanced = muted plum. Optional tracks read as secondary, never loud.
export function TrackBadge({ track }: { track: Track }) {
  return (
    <span className={`track-badge track-badge--${track}`}>
      {TRACK_LABEL[track]}
    </span>
  );
}
