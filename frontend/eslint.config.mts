import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  {
    ignores: ['coverage', 'dist', 'node_modules']
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.browser
    }
  },
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    },
    rules: {
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style']
        }
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'any'
          }
        }
      ],
      'vue/html-indent': 'off',
      'vue/multi-word-component-names': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'vue/singleline-html-element-content-newline': 'off'
    }
  },
  {
    files: ['**/*.{test,spec}.{js,ts,vue}'],
    plugins: {
      vitest
    },
    rules: {
      ...vitest.configs.recommended.rules
    }
  },
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'eol-last': ['error', 'always'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      'jsdoc/require-jsdoc': 'off', // TODO: Turn this back on later
      'max-len': ['warn', { code: 120, comments: 120, ignorePattern: '^(import\\s.+|\\} from)', ignoreUrls: true }],
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      quotes: ['error', 'single'],
      semi: ['error', 'always']
    }
  }
]);
