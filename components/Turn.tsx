import { Markdown } from './Markdown';
import { PulsingDots } from './PulsingDots';
import { ReasoningTrace } from './ReasoningTrace';
import type { ToolCall } from './ToolChip';

type BaseProps = {
  content: string;
};

export function UserTurn({ content }: BaseProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">You</div>
      <div className="whitespace-pre-wrap text-[15px] leading-[26px] text-ink">{content}</div>
    </div>
  );
}

type AgentProps = BaseProps & {
  toolCalls?: ToolCall[];
  streaming?: boolean;
};

export function AgentTurn({ content, toolCalls, streaming }: AgentProps) {
  const empty = !content.trim();
  return (
    <div className="rounded-2xl bg-sage-soft px-6 py-5">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-sage">
        <span>Kaizen</span>
      </div>
      <div className="mt-2">
        {streaming && empty ? (
          <PulsingDots />
        ) : (
          <Markdown source={content} />
        )}
      </div>
      {toolCalls && toolCalls.length > 0 && <ReasoningTrace calls={toolCalls} />}
    </div>
  );
}
