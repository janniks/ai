'use client';

import type { Resource } from '../data/types';
import { TYPE_LABEL } from '../data/types';
import { Cover } from './Cover';
import { CheckIcon, TypeIcon } from '../lib/icons';

interface Props {
  resource: Resource;
  done: boolean;
  onToggle: (id: string) => void;
}

// One resource as a compact card in a concept's horizontal rail. The cover and
// title link to the source (new tab); the corner check toggles done. Checking
// never opens the link (separate button).
export function ResourceCard({ resource, done, onToggle }: Props) {
  const label = done
    ? `Mark "${resource.title}" as not done`
    : `Mark "${resource.title}" as done`;

  return (
    <li className={`card${done ? ' card--done' : ''}`}>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="card__cover"
        aria-label={`Open "${resource.title}" in a new tab`}
        tabIndex={-1}
      >
        <Cover resource={resource} />
      </a>

      <button
        type="button"
        className="card__check"
        aria-pressed={done}
        aria-label={label}
        onClick={() => onToggle(resource.id)}
      >
        <span className="card__check-box">
          <CheckIcon className="card__check-mark" width={15} height={15} />
        </span>
      </button>

      <div className="card__body">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="card__title"
        >
          {resource.title}
        </a>
        <p className="card__meta">
          <span className="card__type">
            <TypeIcon type={resource.type} width={12} height={12} />
            {TYPE_LABEL[resource.type]}
          </span>
          <span aria-hidden="true">·</span>
          <span>{resource.author}</span>
          {resource.duration && (
            <>
              <span aria-hidden="true">·</span>
              <span>{resource.duration}</span>
            </>
          )}
        </p>
        <p className="card__why">{resource.why}</p>
      </div>
    </li>
  );
}
