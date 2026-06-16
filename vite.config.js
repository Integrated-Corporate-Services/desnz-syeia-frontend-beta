import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        base: '/frontend',
        plugins: [react()],
        build: {
            target: 'esnext',
            minify: 'esbuild',
            cssMinify: false,
        },
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true, // Suppress deprecation warnings from dependencies
                    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'mixed-decls'],
                }
            }
        },
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: './src/test/setup.ts',
        },
        server: {
            host: true,
            port: 5173,
            open: true,
            proxy: {
                '/backend/invites': {
                    target: env.API_URL,
                    changeOrigin: true,
                },
                '/backend/api': {
                    target: env.API_URL,
                    changeOrigin: true,
                },
                '/backend/auth': {
                    target: env.API_URL,
                    changeOrigin: true,
                },
                '/backend/cookies': {
                    target: env.API_URL,
                    changeOrigin: true,
                },
            },
            allowedHosts: [
                "dev.syeia.energysecurity.gov.uk",
                "staging.syeia.energysecurity.gov.uk",
            ],
        },
    };
});