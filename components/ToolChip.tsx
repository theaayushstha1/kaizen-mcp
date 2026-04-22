'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion, toolChipFinishTween, toolChipMountTween } from '@/lib/motion';

export type ToolCallState = 'running' | 'done' | 'error';

export type ToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  state: ToolCallState;
  ms?: number;
};

function truncateArgs(args: Record<string, unknown>, max = 56): { text: string; truncated: boolean } {
  const json = JSON.stringify(args);
  if (json.length <= max) return { text: json, truncated: false };
  return { text: json.slice(0, max - 1) + '…', truncated: true };
}

export function ToolChip({ call }: { call: ToolCall }) {
  const ref = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const prevState = useRef<ToolCallState>(call.state);
  const { text, truncated } = truncateArgs(call.args);

  useEffect(() => {
    if (ref.current) toolChipMountTween(ref.current);
  }, []);

  useEffect(() => {
    if (!dotsRef.current || call.state !== 'running' || prefersReducedMotion()) return;
    const dots = dotsRef.current.querySelectorAll('span');
    const tween = gsap.to(dots, {
      scale: 1.3,
      duration: 0.22,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      stagger: 0.08,
    });
    return () => {
      tween.kill();
    };
  }, [call.state]);

  useEffect(() => {
    if (prevState.current === call.state) return;
    prevState.current = call.state;
    if (call.state === 'done' && ref.current) toolChipFinishTween(ref.current);
  }, [call.state]);

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => truncated && setExpanded((e) => !e)}
        className={`flex items-center gap-2 font-mono text-[11px] leading-4 ${
          truncated ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <span className="text-sage">{call.name}</span>
        <span className="text-ink-whisper">(</span>
        <span className="truncate text-ink-muted">{text}</span>
        <span className="text-ink-whisper">)</span>
        {truncated && (
          <span className="text-ink-whisper hover:text-sage">{expanded ? '▴' : '▾'}</span>
        )}
        <span className="ml-1">
          {call.state === 'running' && (
            <span ref={dotsRef} className="chip-dots inline-flex items-center gap-1" aria-hidden>
              <span className="block h-1 w-1 rounded-full bg-sage" style={{ transformOrigin: 'center' }} />
              <span className="block h-1 w-1 rounded-full bg-sage" style={{ transformOrigin: 'center' }} />
              <span className="block h-1 w-1 rounded-full bg-sage" style={{ transformOrigin: 'center' }} />
            </span>
          )}
          {call.state === 'done' && (
            <span className="chip-ok text-ink-whisper">ok {call.ms ?? 0}ms</span>
          )}
          {call.state === 'error' && <span className="text-rust">error</span>}
        </span>
      </button>
      {expanded && (
        <pre className="mb-1 mt-[-2px] rounded-md border border-line bg-paper p-2 font-mono text-[11px] text-ink-muted">
          {JSON.stringify(call.args, null, 2)}
        </pre>
      )}
    </div>
  );
}
