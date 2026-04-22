'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { errorShakeTween, prefersReducedMotion } from '@/lib/motion';

type Props = {
  value: string;
  disabled?: boolean;
  error?: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
};

export function Composer({ value, disabled, error, onChange, onSubmit }: Props) {
  const wrapRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !value.trim()) return;
    if (!prefersReducedMotion() && buttonRef.current) {
      gsap.fromTo(buttonRef.current, { scale: 0.94 }, { scale: 1, duration: 0.08, ease: 'power2.out' });
    }
    onSubmit();
  };

  if (error && wrapRef.current) {
    errorShakeTween(wrapRef.current);
  }

  return (
    <form ref={wrapRef} onSubmit={handleSubmit} className="anim-composer flex items-center gap-3">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask about Dark Noise's revenue, trials, churn"
        disabled={disabled}
        className={`h-11 flex-1 rounded-full border bg-surface pl-[18px] pr-4 text-[15px] text-ink outline-none transition-[box-shadow,border-color] shadow-card placeholder:text-ink-whisper disabled:opacity-60 ${
          error
            ? 'border-rust focus:border-rust'
            : 'border-line focus:border-sage focus:shadow-focus-sage'
        }`}
      />
      <button
        ref={buttonRef}
        type="submit"
        disabled={disabled || !value.trim()}
        className="h-11 rounded-full bg-ink px-5 text-[13px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-sage"
      >
        Ask
      </button>
    </form>
  );
}
