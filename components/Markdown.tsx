import { renderMarkdown } from '@/lib/markdown';

export function Markdown({ source }: { source: string }) {
  return (
    <div
      className="prose text-[15px] leading-[26px] text-ink"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }}
    />
  );
}
