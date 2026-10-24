// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// Las páginas del sitio se generan como HTML estático.
// Solo el panel /keystatic (CMS) corre en el servidor de Vercel.
export default defineConfig({
  site: 'https://caridad-franciscana.vercel.app', // Cambiar cuando tengan dominio propio
  output: 'static',
  devToolbar: { enabled: false },
  adapter: vercel(),
  integrations: [react(), keystatic()],
  vite: {
    plugins: [tailwindcss()],
  },
});
