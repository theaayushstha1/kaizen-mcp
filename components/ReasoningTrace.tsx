'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/motion';
import { ToolChip, type ToolCall } from './ToolChip';

export function ReasoningTrace({ calls }: { calls: ToolCall[] }) {
  const [open, setOpen] = useState(calls.length === 1);
  const chevronRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    if (open) {
      body.style.maxHeight = body.scrollHeight + 'px';
    } else {
      body.style.maxHeight = '0px';
    }
  }, [open, calls.length]);

  useEffect(() => {
    if (!chevronRef.current || prefersReducedMotion()) {
      if (chevronRef.current) chevronRef.current.style.transform = `rotate(${open ? 90 : 0}deg)`;
      return;
    }
    gsap.to(chevronRef.current, {
      rotate: open ? 90 : 0,
      duration: 0.22,
      ease: 'power2.out',
      transformOrigin: 'center',
    });
  }, [open]);

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-1.5 font-mono text-[11px] leading-4 text-ink-muted transition-colors hover:text-sage"
      >
        <svg
          ref={chevronRef}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path
            d="M4 2.5L8 6L4 9.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          {open ? 'Hide' : 'Show'} reasoning trace ({calls.length})
        </span>
      </button>
      <div
        ref={bodyRef}
        className="trace-body"
        style={{ maxHeight: 0 }}
      >
        <div className="mt-2 space-y-2.5 pl-4">
          {calls.map((c) => (
            <ToolChip key={c.id} call={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
