import type { ConfigEnv, UserConfig, AliasOptions, PluginOption } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wellManagerSystemPlugin from './scripts/wm-system-plugin.js';


const aliasOptions: AliasOptions = [
  {find: 'app/', replacement: '/src/app/'},
  {find: 'assets/', replacement: '/src/assets/'},
  {find: 'widgets/', replacement: '/src/widgets/'},
  {find: 'features/', replacement: '/src/features/'},
  {find: 'entities/', replacement: '/src/entities/'},
  {find: 'shared/', replacement: '/src/shared/'},
];

export default defineConfig((env: ConfigEnv): UserConfig => {
  const devMode = env.mode === 'development';
  const plugins: PluginOption[] = [react()];
  if (devMode) plugins.push(wellManagerSystemPlugin(env.command));

  return {
    base: devMode ? './' : '/PATH_TO_REPLACE/',
    plugins: plugins,
    server: {
      port: 3000,
    },
    build: {
      target: 'es2020',
      outDir: './build',
      sourcemap: devMode,
      assetsInlineLimit: 2048,
    },
    esbuild: {
      // IIS по умолчанию не поддерживает UTF-8
      charset: 'ascii',
    },
    resolve: {
      alias: aliasOptions,
    },
    assetsInclude: ['**/*.bin', '**/*.def'],
  };
});
