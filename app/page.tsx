'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ChatPanel, type ChatTurn } from '@/components/ChatPanel';
import { Composer } from '@/components/Composer';
import { Footer } from '@/components/Footer';
import type { ToolCall } from '@/components/ToolChip';
import { pageEnterTimeline } from '@/lib/motion';

export default function Home() {
  const scopeRef = useRef<HTMLElement>(null);
  const [cacheAge, setCacheAge] = useState(0);

  const { messages, input, handleInputChange, handleSubmit, status, error, append } = useChat({
    api: '/api/chat',
    onFinish: () => setCacheAge(0),
  });

  useEffect(() => {
    if (scopeRef.current) pageEnterTimeline(scopeRef.current);
  }, []);

  const turns: ChatTurn[] = messages.map((m) => {
    if (m.role === 'user') return { kind: 'user', content: m.content };
    const toolCalls: ToolCall[] = (m.toolInvocations ?? []).map((t) => ({
      id: t.toolCallId,
      name: t.toolName,
      args: t.args as Record<string, unknown>,
      state: t.state === 'result' ? 'done' : 'running',
      ms: undefined,
    }));
    return {
      kind: 'agent',
      content: m.content ?? '',
      toolCalls,
      streaming: status === 'streaming' && m === messages[messages.length - 1],
    };
  });

  const isBusy = status === 'streaming' || status === 'submitted';

  const pickSuggestion = (q: string) => {
    append({ role: 'user', content: q });
  };

  return (
    <main ref={scopeRef} className="mx-auto flex min-h-screen max-w-[720px] flex-col px-6 py-10">
      <Header cacheAge={cacheAge} />
      <Hero />
      <div className="mt-9 flex flex-1 flex-col">
        <ChatPanel turns={turns} onPickSuggestion={pickSuggestion} />
        <div className="mt-5">
          <Composer
            value={input}
            disabled={isBusy}
            error={Boolean(error)}
            onChange={(v) =>
              handleInputChange({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>)
            }
            onSubmit={() => handleSubmit()}
          />
          {error && (
            <div className="mt-2 text-[12px] text-rust">
              Could not reach Charts. Try again in a moment.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
