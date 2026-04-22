export type ReplayTurn =
  | { kind: 'user'; text: string }
  | {
      kind: 'agent';
      text: string;
      toolCalls: Array<{ name: string; args: Record<string, unknown>; ms: number }>;
    };

export const REPLAY_SESSION: ReplayTurn[] = [
  {
    kind: 'user',
    text: 'How is Dark Noise doing right now?',
  },
  {
    kind: 'agent',
    text:
      'Dark Noise currently has **68 active trials** and **2,535 active subscriptions**. Over the last 28 days the app generated **$4,561 in MRR** and **$4,916 in revenue** across 627 transactions, with 1,401 new customers and 13,580 active users.',
    toolCalls: [{ name: 'kaizen_get_overview', args: {}, ms: 360 }],
  },
  {
    kind: 'user',
    text: 'What is the trial conversion rate?',
  },
  {
    kind: 'agent',
    text:
      'The average trial conversion rate over the last 30 days (March 23, 2026 to April 22, 2026) was **26.51%**. Data for the period of April 14, 2026 to April 22, 2026 is still settling, so expect that number to move a little as the last eight days close out.',
    toolCalls: [
      { name: 'kaizen_list_charts', args: {}, ms: 4 },
      {
        name: 'kaizen_get_chart',
        args: {
          name: 'trial_conversion_rate',
          resolution: 'day',
          start_date: '2026-03-23',
          end_date: '2026-04-22',
        },
        ms: 412,
      },
    ],
  },
  {
    kind: 'user',
    text: 'Break down MRR by store for the last 90 days.',
  },
  {
    kind: 'agent',
    text:
      "Here is the MRR broken down by store for the last 90 days (January 23, 2026 to April 22, 2026):\n\n- **App Store**: total MRR approximately $4,545, the dominant channel.\n- **Play Store**: negligible, under $10 average MRR across the window.\n- **Stripe / Web Billing / others**: not active for this project.\n\nDark Noise is effectively an iOS business. The last week (April 14 to April 22) is still settling, so the numbers above exclude those periods from the average.",
    toolCalls: [
      { name: 'kaizen_describe_chart', args: { name: 'mrr' }, ms: 198 },
      {
        name: 'kaizen_get_chart',
        args: {
          name: 'mrr',
          resolution: 'week',
          start_date: '2026-01-23',
          end_date: '2026-04-22',
          segment: 'store',
        },
        ms: 2335,
      },
    ],
  },
];
