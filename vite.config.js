import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        base: '/frontend',
        plugins: [react()],
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true,
                    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'mixed-decls'],
                }
            }
        },
        build: {
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: mode === 'production',
                    drop_debugger: true,
                    pure_funcs: mode === 'production' ? [
                        'console.log',
                        'console.info',
                        'console.debug',
                        'console.trace',
                    ] : [],
                    dead_code: true,
                    unused: true,
                },
                mangle: {
                    reserved: [],
                },
                format: {
                    comments: false,
                },
            },
            sourcemap: mode === 'production' ? 'hidden' : true,
            chunkSizeWarningLimit: 1000,
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
                '/backend/csrf-token': {
                    target: env.API_URL,
                    changeOrigin: true,
                },
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