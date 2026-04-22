'use client';

import { useEffect, useRef } from 'react';
import { AgentTurn, UserTurn } from './Turn';
import { EmptyState } from './EmptyState';
import type { ToolCall } from './ToolChip';

export type ChatTurn =
  | { kind: 'user'; content: string }
  | { kind: 'agent'; content: string; toolCalls: ToolCall[]; streaming: boolean };

type Props = {
  turns: ChatTurn[];
  onPickSuggestion: (q: string) => void;
  skipButton?: React.ReactNode;
};

export function ChatPanel({ turns, onPickSuggestion, skipButton }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  return (
    <div className="anim-chat-panel relative flex min-h-[540px] flex-1 flex-col overflow-hidden rounded-panel border border-line bg-surface p-7 px-8 shadow-card">
      {skipButton && <div className="absolute right-4 top-4">{skipButton}</div>}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2"
        aria-live="polite"
      >
        {turns.length === 0 ? (
          <EmptyState onPick={onPickSuggestion} />
        ) : (
          turns.map((t, i) =>
            t.kind === 'user' ? (
              <UserTurn key={i} content={t.content} />
            ) : (
              <AgentTurn
                key={i}
                content={t.content}
                toolCalls={t.toolCalls}
                streaming={t.streaming}
              />
            ),
          )
        )}
      </div>
    </div>
  );
}
