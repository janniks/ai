'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

// The horizontal scroller for a concept's cards. Adds two behaviors the bare
// <ol> cannot give: edge fades that appear only when there is more to scroll
// (data-l / data-r on the wrapper drive CSS gradients), and drag-to-scroll for
// mouse users without a trackpad. A drag is only recognized past a small
// threshold so clicks on cards keep working; after a real drag the next click
// is swallowed.
export function Rail({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const drag = useRef({ down: false, dragged: false, x: 0, left: 0 });

  useEffect(() => {
    const el = list.current;
    const w = wrap.current;
    if (!el || !w) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      w.toggleAttribute('data-l', el.scrollLeft > 2);
      w.toggleAttribute('data-r', el.scrollLeft < max - 2);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = list.current;
    if (!el) return;
    // Stop native text selection from starting; clicks on links still fire.
    e.preventDefault();
    drag.current = { down: true, dragged: false, x: e.clientX, left: el.scrollLeft };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = list.current;
    if (!d.down || !el) return;
    const dx = e.clientX - d.x;
    if (!d.dragged && Math.abs(dx) < 5) return;
    if (!d.dragged) {
      d.dragged = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add('rail--dragging');
    }
    el.scrollLeft = d.left - dx;
  };

  const endDrag = (e: React.PointerEvent) => {
    const el = list.current;
    if (drag.current.dragged && el) {
      el.releasePointerCapture(e.pointerId);
      el.classList.remove('rail--dragging');
    }
    drag.current.down = false;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (!drag.current.dragged) return;
    drag.current.dragged = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div ref={wrap} className="rail-wrap">
      <ol
        ref={list}
        className="concept__rail"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {children}
      </ol>
    </div>
  );
}
