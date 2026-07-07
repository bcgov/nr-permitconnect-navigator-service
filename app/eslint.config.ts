import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['coverage/**', 'dist/**', 'vitest.config.ts', 'node_modules/**', 'sbin/**']
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
      'jsdoc/require-jsdoc': 'off', // TODO: Turn this back on later
      'linebreak-style': ['error', 'unix'],
      'max-len': ['warn', { code: 120, comments: 120, ignoreUrls: true }],
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      quotes: ['error', 'single'],
      semi: ['error', 'always']
    }
  },
  // Entity repositories must go through inherited query/mutation methods,
  // never touch `this.model` directly — that's only for readable.ts/writable.ts
  // to implement the base methods themselves.
  {
    files: ['src/repository/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.type='ThisExpression'][property.name='model']",
          message:
            'Use inherited query methods (this.findMany, this.create, etc.) instead of this.model directly. Only readable.ts/writable.ts may access this.model.'
        }
      ]
    }
  },
  {
    files: ['src/repository/readable.ts', 'src/repository/writable.ts'],
    rules: {
      'no-restricted-syntax': 'off'
    }
  }
]);
