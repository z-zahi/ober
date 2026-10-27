/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Palette taken from the team's ober-app repo: black on white, grey text and hairline borders.
      colors: {
        ink: '#000000',
        muted: '#666666',
        subtle: '#777777',
        faint: '#888888',
        line: '#dddddd',
        'line-soft': '#e5e5e5',
        surface: '#f4f4f4',
        success: '#16803d',
        danger: '#b91c1c',
      },
      borderRadius: {
        field: '10px',
        card: '12px',
      },
    },
  },
  plugins: [],
};
