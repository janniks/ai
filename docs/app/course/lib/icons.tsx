// One coherent inline icon set. ~1.5px stroke, 24px viewBox, currentColor.
// No icon dependency. Decorative by default (aria-hidden); callers add labels.

import type { SVGProps } from 'react';
import type { ResourceType } from '../data/types';

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />
    </Svg>
  );
}

export function ChevronIcon(props: IconProps) {
  // Points down by default; rotate via CSS for disclosure state.
  return (
    <Svg {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Svg>
  );
}

function PlayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 5.5l11 6.5-11 6.5z" />
    </Svg>
  );
}

function BookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15.5H5.5A1.5 1.5 0 0 0 4 21z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15.5h5.5A1.5 1.5 0 0 1 20 21z" />
    </Svg>
  );
}

function DocumentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 3.5h7l5 5V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z" />
      <path d="M13 3.5V8a.5.5 0 0 0 .5.5H18" />
      <path d="M9 13h6M9 16.5h6" />
    </Svg>
  );
}

function PaperIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 3.5h6.5L18 8v12a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z" />
      <path d="M13.5 3.5V8h4.5" />
      <path d="M9.5 12.5h5M9.5 15.5h5M9.5 18h3" />
    </Svg>
  );
}

function CourseIcon(props: IconProps) {
  // Mortarboard / academic cap.
  return (
    <Svg {...props}>
      <path d="M12 4.5L2.5 9 12 13.5 21.5 9z" />
      <path d="M6.5 11v4.2c0 .4.2.7.6.9 1.4.7 3.2 1.1 4.9 1.1s3.5-.4 4.9-1.1c.4-.2.6-.5.6-.9V11" />
      <path d="M21.5 9v4" />
    </Svg>
  );
}

function CursorIcon(props: IconProps) {
  // Interactive: pointer/click motif.
  return (
    <Svg {...props}>
      <path d="M6 4l12 6-5 1.6L11.8 17z" />
    </Svg>
  );
}

export function ResetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 9A8 8 0 1 1 4 12" />
      <path d="M4.5 4v5h5" />
    </Svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 6.5h12M8 12h12M8 17.5h12" />
      <path d="M4 6.5h.01M4 12h.01M4 17.5h.01" />
    </Svg>
  );
}

/** Map a ResourceType to its motif icon (used in covers and type labels). */
export function TypeIcon({
  type,
  ...props
}: IconProps & { type: ResourceType }) {
  switch (type) {
    case 'video':
      return <PlayIcon {...props} />;
    case 'article':
      return <DocumentIcon {...props} />;
    case 'book':
      return <BookIcon {...props} />;
    case 'paper':
      return <PaperIcon {...props} />;
    case 'course':
      return <CourseIcon {...props} />;
    case 'interactive':
      return <CursorIcon {...props} />;
  }
}
