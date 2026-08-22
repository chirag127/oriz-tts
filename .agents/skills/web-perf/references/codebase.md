# Codebase Analysis (Phase 5)

**Skip if auditing a third-party site without codebase access.**

Analyze the codebase to understand where improvements can be made.

## Detect Framework & Bundler

Search for configuration files to identify the stack:

| Tool      | Config Files                                      |
| --------- | ------------------------------------------------- |
| Webpack   | `webpack.config.js`, `webpack.*.js`               |
| Vite      | `vite.config.js`, `vite.config.ts`                |
| Rollup    | `rollup.config.js`, `rollup.config.mjs`           |
| esbuild   | `esbuild.config.js`, build scripts with `esbuild` |
| Parcel    | `.parcelrc`, `package.json` (parcel field)        |
| Next.js   | `next.config.js`, `next.config.mjs`               |
| Nuxt      | `nuxt.config.js`, `nuxt.config.ts`                |
| SvelteKit | `svelte.config.js`                                |
| Astro     | `astro.config.mjs`                                |

Also check `package.json` for framework dependencies and build scripts.

## Tree-Shaking & Dead Code

- **Webpack**: Check for `mode: 'production'`, `sideEffects` in package.json, `usedExports` optimization
- **Vite/Rollup**: Tree-shaking enabled by default; check for `treeshake` options
- **Look for**: Barrel files (`index.js` re-exports), large utility libraries imported wholesale (lodash, moment)

## Unused JS/CSS

- Check for CSS-in-JS vs. static CSS extraction
- Look for PurgeCSS/UnCSS configuration (Tailwind's `content` config)
- Identify dynamic imports vs. eager loading

## Polyfills

- Check for `@babel/preset-env` targets and `useBuiltIns` setting
- Look for `core-js` imports (often oversized)
- Check `browserslist` config for overly broad targeting

## Compression & Minification

- Check for `terser`, `esbuild`, or `swc` minification
- Look for gzip/brotli compression in build output or server config
- Check for source maps in production builds (should be external or disabled)
