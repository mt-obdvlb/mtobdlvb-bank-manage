import { defineConfig } from 'tsup'
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths'
import * as path from 'path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  watch: ['src'],
  esbuildPlugins: [
    TsconfigPathsPlugin({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }),
  ],
})
