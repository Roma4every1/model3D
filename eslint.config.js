import jsEslint from '@eslint/js';
import tsEslint from 'typescript-eslint'
import globals from 'globals';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';


export default tsEslint.config({
  extends: [jsEslint.configs.recommended, ...tsEslint.configs.recommended],
  files: ['**/*.{ts,tsx}'],
  ignores: ['node_modules', 'build', 'scripts'],
  plugins: {
    'react-hooks': pluginReactHooks,
    'react-refresh': pluginReactRefresh,
    '@typescript-eslint': tsEslint.plugin,
  },
  languageOptions: {
    globals: globals.browser,
  },
  rules: {
    'no-empty': 'warn',
    'prefer-const': 'off',
    'no-useless-escape': 'off',
    'no-constant-condition': ['error', {checkLoops: false}],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': ['warn', {allowConstantExport: true}],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-expressions': ['error', {allowTernary: true}],
    '@typescript-eslint/no-empty-object-type': 'error',
  },
});
