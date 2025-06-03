import type { ConfigEnv, UserConfig, AliasOptions, Plugin, PluginOption } from 'vite';
import { defineConfig } from 'vite';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';


const allSystems: string[] = [
  'ADMIN_SYSTEM', 'ADMIN_SYSTEM_PGS', 'DEMO',
  'GRP_SYSTEM', 'GRP_SYSTEM_PGS', 'KERN_SYSTEM', 'KERN_SYSTEM_PGS',
  'NEF_SYSTEM', 'NEF_SYSTEM_PGS', 'PREPARE_SYSTEM', 'PREPARE_SYSTEM_PGS',
];
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
  if (devMode && env.command === 'build') plugins.push(wmSystemPlugin());

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

function wmSystemPlugin(): Plugin {
  return {
    name: 'wm-system-plugin',
    enforce: 'post', apply: 'build',
    closeBundle: createSystemDirectories,
  };
}

function createSystemDirectories(error?: Error): void {
  if (error) return;
  const htmlFileName = 'index.html';
  const systemDirectoryPath = './build/systems';

  try {
    mkdirSync(systemDirectoryPath);
  } catch (e: any) {
    if (e.code !== 'EEXIST') console.log(e.message);
  }
  const existingDirectories = readdirSync(systemDirectoryPath);
  const htmlSource = readFileSync('./build/' + htmlFileName, {encoding: 'utf-8'});
  const htmlBundle = htmlSource.replaceAll('="./', '="../../');

  for (const systemID of allSystems) {
    const systemPath = systemDirectoryPath + '/' + systemID;
    if (!existingDirectories.includes(systemID)) mkdirSync(systemPath);
    writeFileSync(systemPath + '/' + htmlFileName, htmlBundle);
  }
}
