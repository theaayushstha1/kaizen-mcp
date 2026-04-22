import { CachePill } from './CachePill';

type Props = {
  demo?: boolean;
  cacheLabel?: string;
  cacheAge?: number;
};

export function Header({ demo, cacheLabel, cacheAge }: Props) {
  return (
    <header className="anim-header flex h-7 items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
        <span className="ml-1 text-[13px] font-semibold text-ink">Kaizen</span>
        <span className="mx-2 h-2.5 w-px bg-line" />
        <span className="hidden text-[12px] text-ink-muted sm:inline">Dark Noise</span>
      </div>
      <CachePill ageSeconds={cacheAge} demo={demo} label={cacheLabel} />
    </header>
  );
}
