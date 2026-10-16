/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // User Specified Palette
        navy: {
          DEFAULT: '#0A2540',
          hover: '#071A2E',
          light: '#13355A',
        },
        saffron: {
          DEFAULT: '#FF9933',
          dark: '#FFA94D',
        },
        indiaGreen: {
          DEFAULT: '#138808',
          dark: '#4CC46A',
          hover: '#0f6e06',
        },
        mandiBlue: {
          DEFAULT: '#3B6EA5',
          dark: '#6FA3DB',
        },
        mandiRed: {
          DEFAULT: '#C0392B',
          dark: '#F0776A',
        },
        pageBg: '#EEF3F8',
        slateText: '#5B6B7D',
        dividerLine: '#D5DEE8',

        // Dark Mode Variants
        darkPage: '#0B1626',
        darkCard: '#13243A',
        darkText: '#EAF0F7',

        // Agricultural aliases for existing references
        charcoal: {
          950: '#0B1626',
          900: '#0A2540',
          850: '#13243A',
          800: '#1a2320',
          700: '#5B6B7D',
          600: '#5B6B7D',
        },
        agri: {
          dark: '#0A2540',
          primary: '#138808',
          green: '#138808',
          light: '#4CC46A',
          pale: '#dcfce7',
          mint: '#f0fdf4',
        },
        krushiOrange: {
          DEFAULT: '#0A2540',
          hover: '#071A2E',
          light: '#FF9933',
          glow: 'rgba(255, 153, 51, 0.25)',
        },
        cardBg: '#ffffff',
        cardBgSoft: '#EEF3F8',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'farmer-card': '0 4px 20px -2px rgba(10, 37, 64, 0.08), 0 2px 6px -1px rgba(10, 37, 64, 0.04)',
        'saffron-glow': '0 0 20px rgba(255, 153, 51, 0.35)',
        'green-glow': '0 0 20px rgba(19, 136, 8, 0.25)',
      }
    },
  },
  plugins: [],
}
