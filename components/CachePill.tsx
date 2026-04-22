'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/motion';

type Props = {
  ageSeconds?: number;
  demo?: boolean;
  label?: string;
};

export function CachePill({ ageSeconds, demo, label }: Props) {
  const [age, setAge] = useState(ageSeconds ?? 0);
  const prev = useRef(age);
  const digitRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (label) return;
    if (typeof ageSeconds === 'number') {
      setAge(ageSeconds);
      return;
    }
    const t = setInterval(() => setAge((a) => a + 1), 1000);
    return () => clearInterval(t);
  }, [ageSeconds, label]);

  useEffect(() => {
    if (label) return;
    if (prev.current === age) return;
    prev.current = age;
    if (prefersReducedMotion()) return;
    if (digitRef.current) {
      gsap.fromTo(
        digitRef.current,
        { scale: 0.9, opacity: 0.6 },
        { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out' },
      );
    }
  }, [age, label]);

  useEffect(() => {
    if (!dotRef.current || prefersReducedMotion()) return;
    const tween = gsap.to(dotRef.current, {
      scale: 1.35,
      duration: 0.6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
    return () => {
      tween.kill();
    };
  }, []);

  const text = label ?? `cache ${age}s`;

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 font-mono text-[11px] text-ink-whisper">
        {!label && (
          <span
            ref={dotRef}
            className="inline-block h-[5px] w-[5px] rounded-full bg-sage"
            style={{ transformOrigin: 'center' }}
          />
        )}
        <span ref={digitRef} className="tabular-nums">
          {text}
        </span>
      </div>
      {demo && (
        <div className="flex h-7 items-center rounded-full border border-line bg-paper px-2.5 font-mono text-[11px] text-ink-whisper">
          demo replay
        </div>
      )}
    </div>
  );
}
