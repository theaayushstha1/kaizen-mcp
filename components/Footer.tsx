import Link from 'next/link';

const links = [
  { href: 'https://github.com/theaayushstha1/kaizen-mcp', label: 'repo' },
  { href: '/blog/your-agent-is-a-customer-now', label: 'blog' },
  { href: '/demo', label: 'demo' },
  { href: 'https://github.com/theaayushstha1/kaizen-mcp/blob/main/evals/SCORECARD.md', label: 'scorecard' },
  { href: 'https://github.com/theaayushstha1/kaizen-mcp/blob/main/docs/PROCESS.md', label: 'process log' },
];

export function Footer() {
  return (
    <footer className="anim-footer mt-6 flex flex-col items-start justify-between gap-2 text-[12px] text-ink-whisper md:flex-row md:items-center">
      <div>
        Built by Kaizen, an AI agent. Operated by{' '}
        <a
          className="text-ink transition-colors hover:text-sage"
          href="https://github.com/theaayushstha1"
          target="_blank"
          rel="noopener"
        >
          Aayush Shrestha
        </a>
        .
      </div>
      <div className="flex items-center gap-2 font-mono text-[11px] text-ink-muted">
        {links.map((l, i) => (
          <span key={l.href} className="flex items-center gap-2">
            {l.href.startsWith('http') ? (
              <a
                className="transition-colors hover:text-sage hover:underline"
                href={l.href}
                target="_blank"
                rel="noopener"
              >
                {l.label}
              </a>
            ) : (
              <Link className="transition-colors hover:text-sage hover:underline" href={l.href}>
                {l.label}
              </Link>
            )}
            {i < links.length - 1 && <span className="text-ink-whisper">·</span>}
          </span>
        ))}
      </div>
    </footer>
  );
}
