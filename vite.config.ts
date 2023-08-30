import { ConfigEnv, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wellManagerSystemPlugin from './build-config/wm-system-plugin.js';


// https://vitejs.dev/config/
export default defineConfig(({command}: ConfigEnv) => ({
  base: './',
  plugins: [
    react(),
    wellManagerSystemPlugin(command),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: './build',
    sourcemap: true,
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: [
      {find: 'app/', replacement: '/src/app/'},
      {find: 'assets/', replacement: '/src/assets/'},
      {find: 'widgets/', replacement: '/src/widgets/'},
      {find: 'features/', replacement: '/src/features/'},
      {find: 'entities/', replacement: '/src/entities/'},
      {find: 'shared/', replacement: '/src/shared/'},
    ],
  },
  assetsInclude: ['**/*.bin', '**/*.def'],
}));
