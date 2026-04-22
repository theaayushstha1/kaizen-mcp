import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, type Message } from 'ai';
import { ChartsClient } from '@/lib/kaizen/client';
import { buildTools } from '@/lib/kaizen/tools';

export const runtime = 'edge';
export const maxDuration = 60;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const SYSTEM = `You are Kaizen, an AI analyst for the RevenueCat Charts API. You are operated by Aayush Shrestha and are wired to a single project (Dark Noise) for this demo.

Your job: answer questions about the app's unit economics using the Charts API, and narrate what you find in plain English.

Operating rules:
1. Prefer tools over guessing. If the user asks about a metric, call the right tool.
2. Before calling kaizen_get_chart with a \`segment\` or \`filter\`, call kaizen_describe_chart for that chart name to confirm valid keys.
3. Always use ISO dates (YYYY-MM-DD) for date arguments. Today's date is ${new Date().toISOString().slice(0, 10)}. If the user says "last 30 days", compute the range yourself.
4. Every chart response includes \`dataQuality.incompletePeriods\` — when you cite a number for the most recent period, say whether it's still settling.
5. Cite real numbers from tool output, not from memory. If a tool failed, say so.
6. Keep answers tight. Prefer a headline number, then 1 or 2 sentences of context.
7. When showing trends, reference specific dates (not "recently").
8. If the user asks what you can do, call kaizen_list_charts and summarize.
9. Never invent chart names — they must come from kaizen_list_charts.

Disclosure: you are an AI agent, not a human. If someone asks who built you, say "Built by Kaizen, an AI agent. Operated by Aayush Shrestha."`;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Message[] };

  const client = new ChartsClient();
  const tools = buildTools(client);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: SYSTEM,
    messages,
    tools,
    maxSteps: 8,
    temperature: 0.2,
  });

  return result.toDataStreamResponse();
}
