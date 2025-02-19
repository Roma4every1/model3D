import type { InlineConfig } from 'vitest/node';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';


export default defineConfig((env) => {
  const testConfig: InlineConfig = {
    globals: false,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    environment: 'jsdom',
    environmentOptions: {jsdom: {resources: 'usable'}},
    server: {deps: {inline: ['vitest-canvas-mock']}},
  };
  return mergeConfig(viteConfig(env), defineConfig({test: testConfig}));
});
