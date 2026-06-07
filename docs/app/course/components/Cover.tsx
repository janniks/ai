'use client';

import { useState } from 'react';
import type { Resource, ResourceType } from '../data/types';
import { TYPE_LABEL } from '../data/types';
import { TypeIcon } from '../lib/icons';

// The cover thumbnail. A designed, type-specific CSS fallback is ALWAYS rendered
// underneath. When `thumbnail` exists we layer a lazy <img> on top; if it errors
// (or while it has not loaded) the designed fallback shows through. No empty gray
// boxes ever appear.

const TYPE_MOTIF: Record<ResourceType, string> = {
  // A short hint shown on the fallback, beneath the source.
  video: 'watch',
  article: 'read',
  book: 'read',
  paper: 'read',
  course: 'study',
  interactive: 'try',
};

function initials(author: string): string {
  const cleaned = author.replace(/\(.*?\)/g, '').trim();
  const words = cleaned.split(/[\s/&]+/).filter(Boolean);
  if (words.length === 0) return '··';
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

interface CoverProps {
  resource: Resource;
  /** When the row is in its collapsed/done state the cover shrinks + desaturates. */
  done?: boolean;
}

export function Cover({ resource, done = false }: CoverProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = Boolean(resource.thumbnail) && !imgFailed;

  const tintStyle = resource.thumbColor
    ? ({ ['--cover-tint' as string]: resource.thumbColor })
    : undefined;

  return (
    <div
      className={`cover cover--${resource.type}${done ? ' cover--done' : ''}`}
      style={tintStyle}
      data-type={resource.type}
    >
      {/* Designed fallback, always present underneath the image. */}
      <div className="cover__fallback" aria-hidden="true">
        <div className="cover__grid" />
        <span className="cover__icon">
          <TypeIcon type={resource.type} width={22} height={22} />
        </span>
        <span className="cover__initials">{initials(resource.author)}</span>
        <span className="cover__motif">{TYPE_MOTIF[resource.type]}</span>
        <span className="cover__kind">{TYPE_LABEL[resource.type]}</span>
      </div>

      {showImg && (
        <img
          className="cover__img"
          src={resource.thumbnail}
          alt=""
          loading="lazy"
          decoding="async"
          width={160}
          height={108}
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}
