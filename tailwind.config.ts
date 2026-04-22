import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fafaf7',
        surface: '#ffffff',
        line: { DEFAULT: '#e6e6e1', strong: '#d4d4cd' },
        ink: { DEFAULT: '#14181a', muted: '#6c7075', whisper: '#9ea1a6' },
        sage: { DEFAULT: '#6b8f71', soft: '#e8efe6' },
        rust: '#a8533a',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,24,26,0.04), 0 8px 24px -12px rgba(20,24,26,0.06)',
        'focus-sage': '0 0 0 3px #e8efe6',
      },
      borderRadius: {
        panel: '20px',
      },
      maxWidth: {
        prose: '62ch',
      },
    },
  },
  plugins: [],
};

export default config;
