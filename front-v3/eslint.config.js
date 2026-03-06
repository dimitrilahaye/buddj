import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/**', 'node_modules/**', '*.config.js', '**/*.css'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        customElements: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        fetch: 'readonly',
        MutationObserver: 'readonly',
      },
    },
  },
];
