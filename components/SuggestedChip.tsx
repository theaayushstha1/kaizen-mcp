'use client';

import { useRef } from 'react';
import { suggestedChipHoverTween } from '@/lib/motion';

type Props = {
  label: string;
  onClick: (label: string) => void;
};

export function SuggestedChip({ label, onClick }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const getTl = () => {
    if (!tlRef.current && ref.current) {
      tlRef.current = suggestedChipHoverTween(ref.current);
    }
    return tlRef.current;
  };

  return (
    <button
      ref={ref}
      type="button"
      onMouseEnter={() => getTl()?.play()}
      onMouseLeave={() => getTl()?.reverse()}
      onFocus={() => getTl()?.play()}
      onBlur={() => getTl()?.reverse()}
      onClick={() => onClick(label)}
      className="chip-suggested rounded-full border border-line bg-paper px-2.5 py-1.5 text-[13px] text-ink outline-none transition-colors focus-visible:border-sage focus-visible:shadow-focus-sage"
    >
      {label}
    </button>
  );
}
