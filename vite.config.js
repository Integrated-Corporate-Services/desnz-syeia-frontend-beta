import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // Determine if we're in production - be defensive about it
    // Only enable source maps explicitly in development mode
    const isDevelopment = mode === 'development' || mode === 'local';
    const isProduction = mode === 'production' || process.env.NODE_ENV === 'production';
    
    return {
        base: env.VITE_ROUTER_BASENAME || '/',
        plugins: [react()],
        
        define: {
            ...(isProduction && {
                '__REACT_DEVTOOLS_GLOBAL_HOOK__': JSON.stringify({ isDisabled: true }),
                'process.env.NODE_ENV': JSON.stringify('production')
            })
        },
        
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
                    drop_console: !isDevelopment,
                    drop_debugger: true,
                    pure_funcs: !isDevelopment ? [
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
            // SECURITY: NEVER generate source maps except in explicit development mode
            // Must be false for production, staging, and any other environment
            sourcemap: false,
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
                '/csrf-token': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/invites': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/api': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/auth': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/cookies/preferences': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/cookies/withdraw': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/cookies/catalog': {
                    target: env.VITE_API_URL,
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