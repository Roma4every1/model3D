import { ConfigEnv, UserConfig, AliasOptions, PluginOption, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wellManagerSystemPlugin from './build-utils/wm-system-plugin.js';


const aliasOptions: AliasOptions = [
  {find: 'app/', replacement: '/src/app/'},
  {find: 'assets/', replacement: '/src/assets/'},
  {find: 'widgets/', replacement: '/src/widgets/'},
  {find: 'features/', replacement: '/src/features/'},
  {find: 'entities/', replacement: '/src/entities/'},
  {find: 'shared/', replacement: '/src/shared/'},
];

// https://vitejs.dev/config/
export default defineConfig((env: ConfigEnv): UserConfig => {
  const devMode = env.mode !== 'prod';
  const plugins: PluginOption[] = [react()];
  if (devMode) plugins.push(wellManagerSystemPlugin(env.command));

  return {
    base: devMode ? './' : '/PATH_TO_REPLACE/',
    plugins: plugins,
    server: {
      port: 3000,
    },
    build: {
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
