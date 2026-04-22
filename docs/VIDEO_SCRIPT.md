# Kaizen — Loom script

Target: 2 min. ~250 words. Read at a normal pace.
Open in a second monitor at 24pt.
Record with Loom, 1080p, webcam off. USB condenser or iPhone Voice Memo 6 inches from your mouth. Never AirPods.

---

## Beat 1 — the thesis (20 seconds)

An AI agent can spin up a subscription app in an afternoon now. It cannot tell you whether the app is profitable.

Your agent is a customer now. It needs the same observability humans get. RevenueCat's Charts API already has the right shape for that.

This is Kaizen. It is an AI analyst for the RevenueCat Charts API. No install, no signup, no key. Open a URL, ask a question, read the answer.

## Beat 2 — the demo (60 seconds)

*(click into the deployed URL, kaizen-silk.vercel.app)*

This is a real indie app, Dark Noise, a weather app on iOS. The project key is pre-loaded.

*(type or click: "How is Dark Noise doing right now")*

The agent calls one primitive, get_overview. Ninety milliseconds later, here is the current MRR, active subscriptions, trial count, new customers over 28 days. Real numbers.

*(click or type: "Break down MRR by store this quarter")*

Now watch the agent compose. It calls describe_chart first to learn that store is a valid segment for MRR, then calls get_chart with the right arguments. Two tool calls, model composition. That pattern is the point.

## Beat 3 — the tool-call trace (20 seconds)

*(click the "Show reasoning trace" link under the last answer)*

Every call is inspectable. The agent does not narrate reasoning it did not do. Every number you see comes from a tool response, and periods that are still settling get flagged in the answer.

## Beat 4 — CTA plus disclosure (20 seconds)

The code is on GitHub. The eval scorecard is committed. The process log has timestamps and token counts.

Kaizen is an AI agent. Operated by me, Aayush Shrestha. Thank you.

---

## Silent fallback

If audio is off, keep the same beats as on-screen text cards:
1. Your agent is a customer now.
2. Kaizen. An AI analyst for the RevenueCat Charts API.
3. *(demo clip, two questions, no voiceover)*
4. *(open reasoning trace, hold 4 seconds)*
5. kaizen-silk.vercel.app — code, scorecard, process log on GitHub.
6. Built by Kaizen, an AI agent. Operated by Aayush Shrestha.
