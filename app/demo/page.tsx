'use client';

import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ChatPanel, type ChatTurn } from '@/components/ChatPanel';
import { Footer } from '@/components/Footer';
import type { ToolCall } from '@/components/ToolChip';
import { pageEnterTimeline } from '@/lib/motion';
import { REPLAY_SESSION } from './session';

const USER_PAUSE_MS = 900;
const TOOL_CALL_GAP_MS = 420;
const TOOL_FINISH_PAD_MS = 260;
const AGENT_TYPE_SPEED_MS = 14;

export default function DemoPage() {
  const scopeRef = useRef<HTMLElement>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [done, setDone] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    if (scopeRef.current) pageEnterTimeline(scopeRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        if (skipRef.current) return resolve();
        setTimeout(resolve, ms);
      });

    async function play() {
      for (const turn of REPLAY_SESSION) {
        if (cancelled) return;

        if (turn.kind === 'user') {
          setTurns((prev) => [...prev, { kind: 'user', content: turn.text }]);
          await delay(USER_PAUSE_MS);
        } else {
          const agent: ChatTurn = {
            kind: 'agent',
            content: '',
            toolCalls: turn.toolCalls.map(
              (tc, i): ToolCall => ({
                id: `${i}`,
                name: tc.name,
                args: tc.args,
                state: 'running',
                ms: tc.ms,
              }),
            ),
            streaming: true,
          };
          setTurns((prev) => [...prev, agent]);

          for (let i = 0; i < turn.toolCalls.length; i += 1) {
            await delay(TOOL_CALL_GAP_MS);
            if (cancelled) return;
            setTurns((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last && last.kind === 'agent') {
                last.toolCalls[i] = { ...last.toolCalls[i], state: 'done' };
              }
              return copy;
            });
          }

          await delay(TOOL_FINISH_PAD_MS);
          await typeText(turn.text, (buf) => {
            setTurns((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last && last.kind === 'agent') last.content = buf;
              return copy;
            });
          }, skipRef);

          setTurns((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.kind === 'agent') last.streaming = false;
            return copy;
          });

          await delay(USER_PAUSE_MS);
        }
      }

      if (!cancelled) setDone(true);
    }

    play();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main ref={scopeRef} className="mx-auto flex min-h-screen max-w-[720px] flex-col px-6 py-10">
      <Header demo cacheAge={0} />
      <Hero />
      <div className="mt-9 flex flex-1 flex-col">
        <ChatPanel
          turns={turns}
          onPickSuggestion={() => {}}
          skipButton={
            !done && (
              <button
                type="button"
                onClick={() => {
                  skipRef.current = true;
                }}
                className="font-mono text-[11px] text-ink-whisper transition-colors hover:text-sage"
              >
                skip
              </button>
            )
          }
        />
        {done && (
          <div className="mt-4 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-ink-whisper">
            replay ended
          </div>
        )}
        <div className="mt-5 flex items-center justify-between rounded-full border border-line bg-surface px-4 py-2.5 text-[13px] text-ink-muted shadow-card">
          <span>Want to ask your own question?</span>
          <a
            href="/"
            className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-sage"
          >
            Try the live app
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}

async function typeText(text: string, onUpdate: (buf: string) => void, skipRef: { current: boolean }) {
  if (skipRef.current) {
    onUpdate(text);
    return;
  }
  let buf = '';
  for (const ch of text) {
    buf += ch;
    onUpdate(buf);
    if (skipRef.current) {
      onUpdate(text);
      return;
    }
    const d = /[\s]/.test(ch) ? AGENT_TYPE_SPEED_MS : AGENT_TYPE_SPEED_MS + Math.random() * 10;
    await new Promise((r) => setTimeout(r, d));
  }
}
