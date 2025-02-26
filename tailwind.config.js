/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'logo-gdrive-yellow': '#f3d9a8',
        'logo-space-blue': '#65c3cd',
        'logo-space-blue-darker': '#45a3ad',
      },
      textColor: {
        white: '#ffffff',
      },
      fontFamily: {
        monospace: ['Courier New', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}

