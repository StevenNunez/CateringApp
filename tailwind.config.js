/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // modo oscuro por clase 'dark'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Tema claro
        primary: 'hsl(25 60% 61%)',           // naranja suave
        background: 'hsl(41 33% 93%)',        // blanco roto suave
        accent: 'hsl(67 33% 45%)',            // verde oliva apagado
        secondary: 'hsl(41 20% 88%)',         // fondo complementario
        destructive: 'hsl(0 84.2% 60.2%)',   // rojo destructivo
        foreground: 'hsl(20 14% 4%)',         // texto principal oscuro

        // Tema oscuro
        'dark-primary': 'hsl(25 60% 61%)',           // mismo naranja
        'dark-background': 'hsl(25 5% 10%)',          // gris muy oscuro
        'dark-accent': 'hsl(67 33% 45%)',             // mismo verde oliva
        'dark-secondary': 'hsl(25 5% 20%)',           // gris oscuro fondo
        'dark-foreground': 'hsl(41 33% 93%)',         // texto claro
        'dark-destructive': 'hsl(0 84.2% 60.2%)',     // rojo destructivo
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        headline: ['"Segoe UI Variable"', '"Segoe UI"', 'system-ui', 'sans-serif'], // ejemplo headline, ajustar si quieres
      }
    }
  },
  plugins: [],
}
