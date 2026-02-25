/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'noir': {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#252532',
        },
        'amber': {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        'danger': '#ef4444',
        'warning': '#f59e0b',
        'safe': '#22c55e',
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        'display': ['"Bebas Neue"', 'Impact', 'sans-serif'],
        'body': ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'typewriter': 'typewriter 2s steps(40) forwards',
        'blink': 'blink 1s steps(1) infinite',
        'highlight': 'highlight 0.5s ease-out forwards',
      },
      keyframes: {
        typewriter: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        blink: {
          '50%': { opacity: '0' },
        },
        highlight: {
          from: { backgroundColor: 'rgba(251, 191, 36, 0.5)' },
          to: { backgroundColor: 'rgba(251, 191, 36, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}
