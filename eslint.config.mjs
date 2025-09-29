import js from '@eslint/js'
import json from '@eslint/json'
import eslintConfigPrettier from 'eslint-config-prettier'
import onlyWarn from 'eslint-plugin-only-warn'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import turboPlugin from 'eslint-plugin-turbo'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default defineConfig([
  ...pluginQuery.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
  },

  {
    ignores: ['dist/**'],
  },

  {
    plugins: {
      turbo: turboPlugin,
    },
    files: ['apps/**', 'packages/**'],
  },

  {
    plugins: {
      onlyWarn,
    },
  },

  {
    plugins: {
      'react-hooks': pluginReactHooks,
      react: pluginReact,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    files: ['apps/web/**'],
  },

  {
    files: ['**/*.json'],
    ...json.configs.recommended,
  },
  {
    files: ['**/*.jsonc'],
    ...json.configs.recommended,
  },
  {
    files: ['**/*.json5'],
    ...json.configs.recommended,
  },

  {
    name: 'prettier-config',
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'warn',
    },
  },
])
