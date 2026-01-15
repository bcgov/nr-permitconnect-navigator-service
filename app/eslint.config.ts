import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['coverage/**', 'dist/**', 'jest.config.js', 'node_modules/**', 'sbin/**']
  },
  {
    files: ['**/*.{js,ts}'],
    extends: [
      // Extensions are order dependent - always apply Prettier last
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      jsdoc.configs['flat/recommended-typescript'],
      eslintPluginPrettierRecommended,
      eslintConfigPrettier // Drops conflicting rules
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname //TODO when type:module => import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'error',
      'eol-last': ['error', 'always'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      'max-len': ['warn', { code: 120, comments: 120, ignoreUrls: true }],
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      quotes: ['error', 'single'],
      'jsdoc/require-jsdoc': 'off', // TODO: Turn this back on later
      semi: ['error', 'always']
    }
  }
);
