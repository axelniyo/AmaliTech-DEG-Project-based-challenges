import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/AmaliTech-DEG-Project-based-challenges/' : '/',
  build: {
    outDir: 'dist',
  }
});
