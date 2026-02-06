/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#1A1A1A',
        'surface-elevated': '#2A2A2A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#CCCCCC',
        'text-muted': '#666666',
        'text-disabled': '#444444',
        'accent-gold': '#FFD700',
        'accent-gold-dim': '#B39700',
        success: '#4CAF50',
        error: '#FF5252',
        border: '#333333',
        'border-subtle': '#222222',
      },
      fontFamily: {
        sans: ['Inter', 'System'],
      },
    },
  },
  plugins: [],
};
