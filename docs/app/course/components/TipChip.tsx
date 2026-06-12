'use client';

import { Tooltip } from 'radix-ui';
import type { ReactNode } from 'react';

// The hoverable math chip. Rendered for `$...${tip:...}` markers in the prose:
// a Radix tooltip (shadcn-style) replaces the old native title attribute, so
// the reading is styled, wraps properly, and works on focus and touch.
export function TipChip({
  tip,
  children,
}: {
  tip: string;
  children: ReactNode;
}) {
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="math-tip" tabIndex={0}>
            {children}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tipcard" sideOffset={6} collisionPadding={12}>
            {tip}
            <Tooltip.Arrow className="tipcard__arrow" width={10} height={5} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
