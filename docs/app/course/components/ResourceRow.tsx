'use client';

import type { Resource } from '../data/types';
import { TYPE_LABEL } from '../data/types';
import { Cover } from './Cover';
import { TrackBadge } from './TrackBadge';
import { ArrowUpRightIcon, CheckIcon, SparkIcon, TypeIcon } from '../lib/icons';

interface ResourceRowProps {
  resource: Resource;
  done: boolean;
  onToggle: (id: string) => void;
  /** Stagger index for first-reveal animation (purely additive). */
  index: number;
}

// One resource, positioned on the chapter spine via .row__node. State:
//  - core:        full card sitting ON the spine (elevated surface).
//  - optional:    background/advanced — branches off the spine, recessed.
//  - inspiration: a warm "moment" — quote-like, spark-marked, still checkable.
// Done state collapses to a slim line; the cover/title link to the resource and
// checking never opens the link.
export function ResourceRow({ resource, done, onToggle, index }: ResourceRowProps) {
  const optional = resource.track === 'background' || resource.track === 'advanced';
  const spark = resource.track === 'inspiration';
  const label = done
    ? `Mark "${resource.title}" as not done`
    : `Mark "${resource.title}" as done`;

  return (
    <li
      className={`row${done ? ' row--done' : ''}${optional ? ' row--optional' : ''}${
        spark ? ' row--spark' : ''
      }`}
      style={{ ['--row-i' as string]: index }}
    >
      <span className="row__node" aria-hidden="true" />

      <button
        type="button"
        className="row__check"
        aria-pressed={done}
        aria-label={label}
        onClick={() => onToggle(resource.id)}
      >
        {spark && !done ? (
          <SparkIcon className="row__spark-mark" width={20} height={20} />
        ) : (
          <span className="row__check-box">
            <CheckIcon className="row__check-mark" width={18} height={18} />
          </span>
        )}
      </button>

      {!spark && (
        <div className="row__cover">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="row__cover-link"
            aria-label={`Open "${resource.title}" in a new tab`}
            tabIndex={-1}
          >
            <Cover resource={resource} done={done} />
          </a>
        </div>
      )}

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
