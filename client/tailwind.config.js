/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        surface: '#1E293B',
        'surface-hover': '#273549',
        border: '#334155',
        primary: {
          DEFAULT: '#22C55E',
          foreground: '#FFFFFF',
          hover: '#16A34A',
        },
        macro: {
          protein: '#3B82F6', // Blue
          carbs: '#F59E0B',   // Amber
          fat: '#F43F5E',     // Rose/Pink
          calories: '#10B981', // Emerald
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
