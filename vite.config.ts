import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages publishes this repository under /Pledge-Invest-Admin/.
  base: '/Pledge-Invest-Admin/',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
});
