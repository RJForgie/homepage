import eslint from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginJSXA11y from 'eslint-plugin-jsx-a11y';

export default [
  eslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.astro'],
    plugins: {
      'jsx-a11y': eslintPluginJSXA11y
    },
    rules: {
      ...eslintPluginJSXA11y.configs.recommended.rules
    },
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro']
      }
    }
  }
];