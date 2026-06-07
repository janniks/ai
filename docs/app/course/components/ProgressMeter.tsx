// Refined progress indicators. Two variants:
//  - "bar": slim horizontal rule that fills with accent (header + chapter use).
//  - "ring": compact SVG ring for the sticky header's compact state.
// Both are presentational; the accessible label lives on the surrounding region.

interface BarProps {
  value: number; // completed
  total: number;
  className?: string;
}

export function ProgressBar({ value, total, className }: BarProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      className={`meter-bar ${className ?? ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-valuetext={`${value} of ${total} core resources complete`}
    >
      <span className="meter-bar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

interface RingProps {
  value: number;
  total: number;
  size?: number;
}

export function ProgressRing({ value, total, size = 30 }: RingProps) {
  const pct = total > 0 ? value / total : 0;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const complete = total > 0 && value >= total;
  return (
    <svg
      className={`meter-ring${complete ? ' meter-ring--complete' : ''}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        className="meter-ring__track"
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        className="meter-ring__fill"
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
