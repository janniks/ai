'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '../lib/progress';
import { ResetIcon } from '../lib/icons';

// Footer reset with an inline confirm step that auto-dismisses. Owns its own
// confirm state; progress comes from context.
export function ResetControl() {
  const { mounted, doneCount, resetAll } = useProgress();
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!confirm) return;
    const t = window.setTimeout(() => setConfirm(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirm]);

  if (confirm)
    return (
      <div className="colophon__reset">
        <span className="reset" role="group" aria-label="Confirm reset">
          <span className="reset__prompt">Reset all progress?</span>
          <button
            type="button"
            className="reset__confirm"
            onClick={() => {
              resetAll();
              setConfirm(false);
            }}
          >
            Yes, reset
          </button>
          <button
            type="button"
            className="reset__cancel"
            onClick={() => setConfirm(false)}
          >
            Cancel
          </button>
        </span>
      </div>
    );

  return (
    <div className="colophon__reset">
      <button
        type="button"
        className="reset__trigger"
        onClick={() => setConfirm(true)}
        disabled={!mounted || doneCount === 0}
      >
        <ResetIcon width={14} height={14} />
        <span>Reset progress</span>
      </button>
    </div>
  );
}
