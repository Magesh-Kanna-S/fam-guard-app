import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// IMPORTANT FOR GITHUB PAGES:
// 1. `base: './'` makes ALL asset references relative to index.html.
//    This is the single most important fix for blank pages on GitHub Pages,
//    because it works regardless of the repo name or sub-path
//    (e.g. /fam-guard-app/, /, or any custom domain).
//
// 2. The `define` block replaces ALL `process.env.*` references at build
//    time. Browsers don't have `process.env` — if we don't replace them, the
//    bundled Gemini SDK throws `ReferenceError: process is not defined` at
//    module-load time, which crashes the entire app and shows a blank page.
//    We provide a generic fallback so other `process.env.FOO` reads the SDK
//    might do resolve to `undefined` instead of throwing.
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiKey = env.GEMINI_API_KEY || '';

    return {
        base: './',
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        build: {
            outDir: 'dist',
            sourcemap: false,
            assetsDir: 'assets',
            // Suppress misleading "chunk > 500kB" warning; the prototype
            // isn't doing route-level code splitting and that's fine.
            chunkSizeWarningLimit: 1500,
        },
        plugins: [
            react(),
            tailwindcss(),
        ],
        define: {
            // The Gemini SDK reads these specific env vars. Replace them at
            // build time so no `process.env` lookup happens in the browser.
            'process.env.API_KEY': JSON.stringify(apiKey),
            'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
            'process.env.GEMINI_NEXT_GEN_API_BASE_URL': JSON.stringify(''),
            'process.env.GEMINI_NEXT_GEN_API_LOG': JSON.stringify(''),
            // Catch-all: any OTHER `process.env.XXX` the SDK or a dependency
            // reads resolves to `undefined` (instead of throwing a
            // ReferenceError that would blank the page).
            'process.env': JSON.stringify({ API_KEY: apiKey, GEMINI_API_KEY: apiKey }),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
