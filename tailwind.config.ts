import type { Config } from 'tailwindcss'

/**
 * Single source of truth for color = CSS custom properties (channels) declared
 * in src/index.css. This helper wires them into Tailwind so opacity modifiers
 * (e.g. `bg-accent/20`) keep working.
 */
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: v('--bg'),
        surface: v('--bg-elevated'),
        'surface-2': v('--bg-elevated-2'),
        fg: v('--fg'),
        muted: v('--muted'),
        faint: v('--faint'),
        accent: {
          DEFAULT: v('--accent'),
          soft: v('--accent-soft'),
          bright: v('--accent-bright'),
          deep: v('--accent-deep'),
        },
        data: v('--data'),
        hairline: 'rgb(var(--hairline) / 0.08)',
      },
      fontFamily: {
        display: ['"Clash Display"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // fluid display sizes
        kicker: ['0.75rem', { lineHeight: '1', letterSpacing: '0.18em' }],
        'display-xl': ['clamp(3.25rem, 13vw, 12rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 8vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 5vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.015em' }],
      },
      letterSpacing: {
        kicker: '0.18em',
        ultra: '0.32em',
      },
      maxWidth: {
        content: '80rem', // 1280px
        prose2: '46rem',
      },
      spacing: {
        section: 'clamp(5rem, 12vw, 12.5rem)',
        gutter: 'clamp(1.25rem, 5vw, 4rem)',
      },
      borderColor: {
        DEFAULT: 'rgb(var(--hairline) / 0.08)',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        power3: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        blink: 'blink 1.1s step-end infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
