/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07131f',
          900: '#0a1a29',
          800: '#10263a',
          700: '#1b3a53',
          600: '#2b506c',
          500: '#476b85',
        },
        paper: {
          DEFAULT: '#f6f6f1',
          deep: '#eeefe8',
          warm: '#fbfaf6',
        },
        line: {
          DEFAULT: '#dfe2da',
          strong: '#c9cec4',
        },
        signal: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b9d1ff',
          500: '#2f63e8',
          600: '#2454d3',
          700: '#1c43ad',
        },
        valid: {
          50: '#e9f7f0',
          100: '#d5efe3',
          600: '#0d6b4d',
          700: '#0a5740',
          800: '#084434',
        },
        invalid: {
          50: '#fdf1ef',
          100: '#fadfdb',
          600: '#b4382e',
          700: '#962b23',
        },
        caution: {
          50: '#fff8e8',
          100: '#fbedc7',
          600: '#9a6608',
          700: '#7c5206',
        },
      },
      fontFamily: {
        sans: ['Manrope Variable', 'Manrope', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(10, 26, 41, 0.04), 0 24px 60px -36px rgba(10, 26, 41, 0.35)',
        lift: '0 18px 40px -28px rgba(10, 26, 41, 0.45)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        toast: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both',
        reveal: 'reveal 200ms ease-out both',
        toast: 'toast 220ms ease-out both',
      },
    },
  },
  plugins: [],
}
