/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12182B',
          light: '#1C2540',
          lighter: '#283256',
        },
        parchment: {
          DEFAULT: '#F2ECDD',
          dim: '#E7DFC9',
        },
        brass: {
          DEFAULT: '#C9A227',
          light: '#E0BE55',
          dim: '#9C7C1D',
        },
        teal: {
          DEFAULT: '#2D6E6E',
          light: '#4A9494',
          dim: '#1E4C4C',
        },
        rust: {
          DEFAULT: '#B5502E',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
