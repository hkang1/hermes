import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    base: mode === 'development' ? './' : '/hermes/',
    build: { outDir: '../docs' },
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
  });
