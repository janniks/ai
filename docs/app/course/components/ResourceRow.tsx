'use client';

import type { Resource } from '../data/types';
import { TYPE_LABEL } from '../data/types';
import { Cover } from './Cover';
import { TrackBadge } from './TrackBadge';
import { ArrowUpRightIcon, CheckIcon, TypeIcon } from '../lib/icons';

interface ResourceRowProps {
  resource: Resource;
  done: boolean;
  onToggle: (id: string) => void;
  /** Stagger index for first-reveal animation (purely additive). */
  index: number;
}

// One resource. Full state: cover, linked title, meta (type · author · duration),
// the "why" line, a track badge, and a separate keyboard-operable check control.
// Done state: collapses to a slim single line; the check stays, the cover shrinks
// and desaturates, the why hides. Checking never opens the link.
export function ResourceRow({ resource, done, onToggle, index }: ResourceRowProps) {
  const optional = resource.track !== 'core';
  const checkLabel = done
    ? `Mark "${resource.title}" as not done`
    : `Mark "${resource.title}" as done`;

  return (
    <li
      className={`row${done ? ' row--done' : ''}${optional ? ' row--optional' : ''}`}
      style={{ ['--row-i' as string]: index }}
    >
      <button
        type="button"
        className="row__check"
        aria-pressed={done}
        aria-label={checkLabel}
        onClick={() => onToggle(resource.id)}
      >
        <span className="row__check-box">
          <CheckIcon className="row__check-mark" width={18} height={18} />
        </span>
      </button>

      <div className="row__cover">
        <Cover resource={resource} done={done} />
      </div>

      <div className="row__main">
        <div className="row__head">
          <h3 className="row__title">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="row__link"
            >
              <span className="row__title-text">{resource.title}</span>
              <ArrowUpRightIcon className="row__link-icon" width={15} height={15} />
            </a>
          </h3>
          <TrackBadge track={resource.track} />
        </div>

        <p className="row__meta">
          <span className="row__type">
            <TypeIcon type={resource.type} width={13} height={13} />
            {TYPE_LABEL[resource.type]}
          </span>
          <span className="row__sep" aria-hidden="true">
            ·
          </span>
          <span className="row__author">{resource.author}</span>
          {resource.duration && (
            <>
              <span className="row__sep" aria-hidden="true">
                ·
              </span>
              <span className="row__duration">{resource.duration}</span>
            </>
          )}
        </p>

        <p className="row__why">{resource.why}</p>
      </div>
    </li>
  );
}
