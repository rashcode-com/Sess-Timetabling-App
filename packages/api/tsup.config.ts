import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/node.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  sourcemap: true,
  noExternal: ['@sess/core']
});
