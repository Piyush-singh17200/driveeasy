/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff0f3',
          100: '#ffdde4',
          200: '#ffc0cc',
          300: '#ff94a8',
          400: '#ff5677',
          500: '#e94560',
          600: '#d42050',
          700: '#b21644',
          800: '#94143f',
          900: '#7d153b',
        },
        dark: {
          900: '#0a0a12',
          800: '#0d0d1a',
          700: '#111122',
          600: '#16162a',
          500: '#1a1a35',
          400: '#22224a',
        },
        accent: '#f0a500',
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'radial-gradient(ellipse at top, #1a1a35 0%, #0a0a12 70%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(233, 69, 96, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(233, 69, 96, 0.8)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(233, 69, 96, 0.4)',
        'glow-lg': '0 0 40px rgba(233, 69, 96, 0.5)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
