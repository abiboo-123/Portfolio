/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1d4ed8',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
}

