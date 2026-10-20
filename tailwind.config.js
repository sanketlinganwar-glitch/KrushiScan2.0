/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Krushi Green Palette
        krushi: {
          forest: '#0B5137',
          leaf: '#2F9E59',
          light: '#E6F2E5',
          bg: '#F6F8F0',
          card: '#FFFFFF',
          text: '#152D24',
          subtext: '#5F7065',
          border: '#DDE8DC',
          hover: '#073D2A',
          success: '#21864A',
          warning: '#E9A23B',
          error: '#C83E3E',
        },
        krushiGreen: {
          forest: '#0B5137',
          leaf: '#2F9E59',
          light: '#E6F2E5',
          bg: '#F6F8F0',
          card: '#FFFFFF',
          text: '#152D24',
          secondary: '#5F7065',
          border: '#DDE8DC',
          hover: '#073D2A',
          success: '#21864A',
          warning: '#E9A23B',
          error: '#C83E3E',
        },

        // Mapped Aliases to preserve all existing class usages with Krushi Green theme
        forestGreen: '#0B5137',
        leafGreen: '#2F9E59',
        lightGreen: '#E6F2E5',
        pageBg: '#F6F8F0',
        cardBg: '#FFFFFF',
        cardBgSoft: '#E6F2E5',
        primaryText: '#152D24',
        slateText: '#5F7065',
        dividerLine: '#DDE8DC',

        navy: {
          DEFAULT: '#0B5137',
          hover: '#073D2A',
          light: '#152D24',
        },
        saffron: {
          DEFAULT: '#E9A23B',
          dark: '#c98528',
        },
        indiaGreen: {
          DEFAULT: '#2F9E59',
          dark: '#21864A',
          hover: '#073D2A',
        },
        mandiBlue: {
          DEFAULT: '#2F9E59',
          dark: '#21864A',
        },
        mandiRed: {
          DEFAULT: '#C83E3E',
          dark: '#ad3232',
        },

        // Dark Mode Variants in deep forest hues
        darkPage: '#071F15',
        darkCard: '#0C2E20',
        darkText: '#E6F2E5',

        // Agricultural aliases
        charcoal: {
          950: '#071F15',
          900: '#0B5137',
          850: '#0C2E20',
          800: '#152D24',
          700: '#5F7065',
          600: '#5F7065',
        },
        agri: {
          dark: '#0B5137',
          primary: '#2F9E59',
          green: '#2F9E59',
          light: '#E6F2E5',
          pale: '#E6F2E5',
          mint: '#F6F8F0',
        },
        krushiOrange: {
          DEFAULT: '#0B5137',
          hover: '#073D2A',
          light: '#2F9E59',
          glow: 'rgba(47, 158, 89, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'farmer-card': '0 4px 20px -2px rgba(11, 81, 55, 0.08), 0 2px 6px -1px rgba(11, 81, 55, 0.04)',
        'krushi-card': '0 4px 20px -2px rgba(11, 81, 55, 0.08), 0 2px 6px -1px rgba(11, 81, 55, 0.04)',
        'saffron-glow': '0 0 20px rgba(233, 162, 59, 0.35)',
        'green-glow': '0 0 20px rgba(47, 158, 89, 0.25)',
        'krushi-glow': '0 0 20px rgba(47, 158, 89, 0.3)',
      }
    },
  },
  plugins: [],
}
