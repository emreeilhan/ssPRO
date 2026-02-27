/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f6f4ef',
        panel: '#fdfbf6',
        ink: '#131313',
        line: '#d4d0c6',
        accent: '#145bff',
        alert: '#b42318',
      },
      fontFamily: {
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        reveal: 'reveal 420ms ease-out both',
      },
    },
  },
  plugins: [],
};
