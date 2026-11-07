/**
 * Ambient declarations for CSS imports handled by the Metro bundler.
 *
 * - Side-effect CSS imports (for example `import '@/global.css'`) only need the
 *   module to be declared.
 * - `*.module.css` imports are typed as a default-exported class name map.
 *
 * Both `*.module.css` and plain `.css` resolve to the same shape here; the
 * wildcard pattern below covers both import styles.
 */
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
