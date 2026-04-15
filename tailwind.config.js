/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sf': ['"SF Pro Text"', '"SF Pro Icons"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        'sf-display': ['"SF Pro Display"', '"SF Pro Icons"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'apple': {
          'blue': '#0071e3',
          'blue-hover': '#0077ed',
          'blue-active': '#006edb',
          'bright-blue': '#2997ff',
          'link': '#0066cc',
          'black': '#000000',
          'near-black': '#1d1d1f',
          'light-gray': '#f5f5f7',
          'dark-surface': '#1d1d1f',
          'danger': '#ff3b30',
        }
      },
      borderRadius: {
        'apple': '8px',
        'apple-lg': '12px',
        'apple-pill': '980px',
      },
      boxShadow: {
        'apple-card': 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0px',
      }
    },
  },
  plugins: [],
}
