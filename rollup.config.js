/**
 * Rollup Configuration — MorphisSDK
 *
 * Produces 3 output formats:
 * - ESM  → dist/morphis-sdk.esm.js   (tree-shakeable, for modern bundlers)
 * - CJS  → dist/morphis-sdk.cjs.js   (for Node.js / legacy SSR environments)
 * - IIFE → dist/morphis-sdk.iife.js  (minified, for CDN <script> tag injection)
 *
 * Usage:
 *   npx rollup -c rollup.config.js
 *
 * Dependencies (devDependencies):
 *   npm i -D rollup @rollup/plugin-terser
 */

import terser from '@rollup/plugin-terser';

const input = 'public/sdk/morphis-sdk.js';
const banner = `/*! MorphisSDK v2.1.0 | (c) ${new Date().getFullYear()} Morphis | MIT License */`;

export default {
  input,
  output: [
    // ESM — preserves import/export, tree-shakeable
    {
      file: 'dist/morphis-sdk.esm.js',
      format: 'es',
      banner,
      sourcemap: true,
    },
    // CJS — for require() in Node/SSR contexts
    {
      file: 'dist/morphis-sdk.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named',
    },
    // IIFE — minified, exposes window.MorphisSDK for CDN usage
    {
      file: 'dist/morphis-sdk.iife.js',
      format: 'iife',
      name: 'MorphisSDK',
      banner,
      sourcemap: true,
      exports: 'named',
      plugins: [terser()],
    },
  ],
};
