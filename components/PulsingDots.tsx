'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/motion';

export function PulsingDots() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const dots = ref.current.querySelectorAll('span');
    const tween = gsap.to(dots, {
      scale: 1.25,
      duration: 0.7,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      stagger: 0.12,
    });
    return () => {
      tween.kill();
    };
  }, []);

  if (prefersReducedMotion()) {
    return <span className="text-ink-muted">...</span>;
  }

  return (
    <span ref={ref} className="inline-flex items-center gap-1" aria-hidden>
      <span className="block h-1.5 w-1.5 rounded-full bg-sage" style={{ transformOrigin: 'center' }} />
      <span className="block h-1.5 w-1.5 rounded-full bg-sage" style={{ transformOrigin: 'center' }} />
      <span className="block h-1.5 w-1.5 rounded-full bg-sage" style={{ transformOrigin: 'center' }} />
    </span>
  );
}
