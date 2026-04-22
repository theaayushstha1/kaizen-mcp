import { SuggestedChip } from './SuggestedChip';

const SUGGESTIONS = [
  'How is Dark Noise doing right now',
  'Show MRR for the last 30 days',
  'Break down MRR by store this quarter',
  'What is the trial conversion rate',
];

export function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-whisper">
        Try one
      </div>
      <div className="mt-4 flex max-w-[520px] flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <SuggestedChip key={s} label={s} onClick={onPick} />
        ))}
      </div>
    </div>
  );
}
